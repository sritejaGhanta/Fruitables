import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';

import { Twilio } from 'twilio';
import * as _ from 'lodash';

import { LoggerHandler } from 'src/utilities/logger-handler';
import { CacheService } from 'src/services/cache.service';
import { DateService } from './date.service';

import { SmsNotifyTemplateEntity } from 'src/entities/sms-notify-template.entity';
import { SmsNotificationsEntity } from 'src/entities/sms-notifications.entity';

import {
  ProcessSmsDto,
  SendSmsObjectDto,
  SendSmsOptionsDto,
  SendSmsParamsDto,
  SmsSendJsonDto,
  SmsLoggerDto,
  SmsTemplateDto,
  SmsVariableDto,
} from 'src/common/dto/sms-notify.dto';
import {
  DynamicKeyAnyDto,
  DynamicKeyMixDto,
  StandardPromiseDto,
  StandardReturnDto,
} from 'src/common/dto/common.dto';
import { TYPE, STATUS } from 'src/common/enum/common.enum';

@Injectable()
export class SmsService {
  private readonly log = new LoggerHandler(SmsService.name).getInstance();

  constructor(
    protected readonly configService: ConfigService,
    private readonly cacheService: CacheService,
    private readonly dateService: DateService,
    @InjectRepository(SmsNotifyTemplateEntity)
    private smsNotifyTmplRepository: Repository<SmsNotifyTemplateEntity>,
    @InjectRepository(SmsNotificationsEntity)
    private smsNotifyLogsRepository: Repository<SmsNotificationsEntity>,
    @InjectQueue('sms-queue') private smsQueue: Queue,
  ) {}

  async getTemplateByCode(code: string): Promise<SmsTemplateDto> {
    let template: SmsTemplateDto;
    try {
      template = await this.smsNotifyTmplRepository.findOne({
        where: { templateCode: code },
      });
      if (!_.isObject(template) || _.isEmpty(template)) {
        throw new Error('SMS template not found.');
      }
    } catch (err) {
      this.log.error('[getSmsNotifyByCode] >> Error ', err);
    }
    return template;
  }

  async processTemplate(
    tmplData: SmsTemplateDto,
    varsData: SmsVariableDto[],
    execData: SendSmsOptionsDto,
  ): Promise<ProcessSmsDto> {
    let smsMessage = tmplData?.message || '';

    const keyValuePair: DynamicKeyMixDto = {};
    let keyValueData: DynamicKeyAnyDto = {};
    if (_.isArray(varsData) && varsData.length > 0) {
      if (_.isObject(execData.params)) {
        keyValueData = execData.params;
      }

      for (const val of varsData) {
        if (val.var_name) {
          let keyName = '';
          let keyValue = '';
          const varName = val.var_name.toString().trim();
          if (
            varName.substr(0, 9) === '{{SYSTEM.' &&
            varName.substr(-2) === '}}'
          ) {
            keyName = varName.slice(9, -2);
            keyValue = await this.cacheService.get(keyName);
          } else if (
            varName.substr(0, 8) === '#SYSTEM.' &&
            varName.substr(-1) === '#'
          ) {
            keyName = varName.slice(8, -1);
            keyValue = await this.cacheService.get(keyName);
          } else if (
            varName.substr(0, 2) === '{{' &&
            varName.substr(-2) === '}}'
          ) {
            keyName = varName.slice(2, -2);
            keyValue = keyValueData[keyName];
          } else if (
            varName.substr(0, 1) === '#' &&
            varName.substr(-1) === '#'
          ) {
            keyName = varName.slice(1, -1);
            keyValue = keyValueData[keyName];
          }
          if (keyName) {
            keyValuePair[keyName] = keyValue;
            const regex = new RegExp(varName, 'g');
            smsMessage = smsMessage.replace(regex, keyValue);
          }
        }
      }
    }

    const processedData: ProcessSmsDto = {
      sms_message: smsMessage,
      key_values: keyValuePair,
    };

    return processedData;
  }

  async processSMS(
    code: string,
    data: SendSmsOptionsDto,
    params: SendSmsParamsDto,
  ): Promise<number> {
    let success;
    try {
      if (!code) {
        throw new Error('Sms notify template is missing');
      }
      if (!_.isObject(data) || _.isEmpty(data)) {
        throw new Error('Parameters object is empty');
      }
      if (!('number' in data)) {
        throw new Error('Mobile number is empty');
      }

      const smsTemplate: SmsTemplateDto = await this.getTemplateByCode(code);
      const smsVariables: SmsVariableDto[] = smsTemplate?.varsJson;
      const processedData: ProcessSmsDto = await this.processTemplate(
        smsTemplate,
        smsVariables,
        data,
      );

      data.message = processedData?.sms_message;

      const dataParams = _.isObject(params) ? { ...params } : {};
      dataParams.template_title = smsTemplate?.templateTitle;
      dataParams.template_code = smsTemplate?.templateCode;

      success = await this.registerSMSNotification(data, dataParams);
    } catch (err) {
      this.log.error('[processSMS] >> Error ', err);
      success = 0;
    }

    return success;
  }

  async sendSMS(options: SendSmsOptionsDto): Promise<StandardReturnDto> {
    let success;
    let message;
    try {
      if (!('number' in options)) {
        throw new Error('Mobile number is empty');
      }

      const accountSid: string = await this.cacheService.get('SMS_TW_API_SID');
      const authToken: string = await this.cacheService.get('SMS_TW_API_TOKEN');
      const fromNumber: string = await this.cacheService.get('SMS_FROM_NUMBER');

      const twilioClient = new Twilio(accountSid, authToken);
      const twilioPayload: SendSmsObjectDto = {
        body: options.message,
        to: options.number,
        from: fromNumber,
      };

      if ('async' in options && options.async === false) {
        const result: StandardPromiseDto = await new Promise(
          (resolve, reject) => {
            twilioClient.messages.create(twilioPayload, (error, response) => {
              const sendStatus: StandardPromiseDto = {};
              if (error) {
                sendStatus.success = 0;
                sendStatus.message = 'SMS sending failed';
                sendStatus.error = error;
              } else if (response.sid) {
                sendStatus.success = 1;
                sendStatus.message = 'SMS sent successfully';
                sendStatus.data = response;
              } else {
                sendStatus.success = 0;
                sendStatus.message = 'SMS sending failed';
                sendStatus.error = response;
              }

              resolve(sendStatus);
            });
          },
        );
        if (!result?.success) {
          throw new Error(result.message);
        }
      } else {
        twilioClient.messages.create(twilioPayload, (error, response) => {
          const sendStatus: StandardPromiseDto = {};
          if (error) {
            sendStatus.success = 0;
            sendStatus.message = 'SMS sending failed';
            sendStatus.error = error;
          } else if (response.sid) {
            sendStatus.success = 1;
            sendStatus.message = 'SMS sent successfully';
            sendStatus.data = response;
          } else {
            sendStatus.success = 0;
            sendStatus.message = 'SMS sending failed';
            sendStatus.error = response;
          }
          if (sendStatus.success === 1) {
            this.handleSmsCallBack(null, options.id);
          } else {
            this.handleSmsCallBack(sendStatus.error, options.id);
          }
        });
      }
      success = 1;
    } catch (err) {
      success = 0;
      message = err;
      this.log.error('[sendSMS] >> Error ', err);
    }
    return { success: success, message: message };
  }

  async logSMS(
    options: SendSmsOptionsDto & SmsSendJsonDto,
    params: SendSmsParamsDto,
  ): Promise<StandardReturnDto> {
    let success = 1;
    let message = '';
    try {
      const sendPriority =
        'priority' in options && options.priority !== ''
          ? options.priority
          : 'default';

      const queryColumns: SmsLoggerDto = {
        receiver: options.number,
        message: options.message,
        type: TYPE.API,
      };

      if (params.template_code) {
        queryColumns.code = params.template_code;
      }

      queryColumns.status = STATUS.PENDING;

      const queryObject = this.smsNotifyLogsRepository.create(queryColumns);
      let resdata = await this.smsNotifyLogsRepository.save(queryObject);

      options.id = resdata.id;

      const is_queue_enabled = this.configService.get(
        'app.enable_notification_queue',
      );

      if (sendPriority == 'immediate' || !is_queue_enabled) {
        let res = await this.sendSMS(options);

        if ('async' in options && options.async === false) {
          if (res.success == 1) {
            this.handleSmsCallBack(null, options.id);
          } else {
            this.handleSmsCallBack(res.message, options.id);
          }
        }

        message = 'Email notification executed.';
      } else {
        let priority: number;

        if (sendPriority == 'high') {
          priority = 1;
        } else if (sendPriority == 'low') {
          priority = 3;
        } else {
          priority = 2;
        }

        await this.smsQueue.add('sms-task', options, {
          priority: priority,
        });

        message = 'Email notification registered.';
      }

      this.log.debug(`[logSMS] >> SMS logging completed.`);
      success = 1;
      message = 'Sms logging completed';
    } catch (err) {
      success = 0;
      message = err;
      this.log.error('[logSMS] >> Error ', err);
    }

    return { success: success, message: message };
  }

  async handleSmsCallBack(error: any, notification_id: number) {
    const queryColumns: any = {};
    queryColumns.status = error === null ? STATUS.EXECUTED : STATUS.FAILED;
    queryColumns.executedAt = this.dateService.getCurrentDateTime();
    if (error != null) {
      queryColumns.error = error.toString();
    }

    const queryObject = this.smsNotifyLogsRepository
      .createQueryBuilder()
      .update(SmsNotificationsEntity)
      .set(queryColumns);
    queryObject.andWhere('id = :id', { id: notification_id });
    await queryObject.execute();
    return true;
  }

  async registerSMSNotification(
    options: SendSmsOptionsDto & SmsSendJsonDto,
    params: SendSmsParamsDto,
  ): Promise<number> {
    let success;
    try {
      if (!('number' in options)) {
        throw new Error('Mobile number is empty');
      }

      let result = await this.logSMS(options, params);
      if (!result?.success) {
        throw new Error(result?.message);
      }
      success = 1;
    } catch (err) {
      success = 0;
      this.log.error('[registerSMSNotification] >> Error ', err);
    }
    return success;
  }
}
