import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';
import * as Notification from 'node-pushnotifications';
import * as _ from 'lodash';

import { LoggerHandler } from 'src/utilities/logger-handler';
import { CacheService } from 'src/services/cache.service';
import { DateService } from './date.service';

import { PushNotifyTemplateEntity } from 'src/entities/push-notify-template.entity';
import { PushNotificationsEntity } from 'src/entities/push-notifications.entity';

import {
  ProcessPushDto,
  PushLoggerDto,
  PushSendJsonDto,
  PushTemplateDto,
  PushVariableDto,
  SendPushObjectDto,
  SendPushOptionsDto,
  SendPushParamsDto,
  PushNotifyConsumerInputDto,
} from 'src/common/dto/push-notify.dto';
import {
  DEVICE,
  MODE,
  SILENT,
  STATUS,
  TYPE,
} from 'src/common/enum/common.enum';
import {
  DynamicKeyAnyDto,
  DynamicKeyMixDto,
  StandardPromiseDto,
  StandardReturnDto,
} from 'src/common/dto/common.dto';

@Injectable()
export class PushNotifyService {
  private readonly log = new LoggerHandler(
    PushNotifyService.name,
  ).getInstance();

  constructor(
    protected readonly configService: ConfigService,
    private readonly cacheService: CacheService,
    private readonly dateService: DateService,
    @InjectRepository(PushNotifyTemplateEntity)
    private pushNotifyTmplRepository: Repository<PushNotifyTemplateEntity>,
    @InjectRepository(PushNotificationsEntity)
    private pushNotifyLogsRepository: Repository<PushNotificationsEntity>,
    @InjectQueue('push-queue') private pushQueue: Queue,
  ) {}

  async getPushNotifyByCode(code: string): Promise<PushTemplateDto> {
    let template: PushTemplateDto;
    try {
      template = await this.pushNotifyTmplRepository.findOne({
        where: { templateCode: code },
      });
      if (!_.isObject(template) || _.isEmpty(template)) {
        throw new Error('Push notify template not found.');
      }
    } catch (err) {
      this.log.error('[getPushNotifyByCode] >> Error ', err);
    }
    return template;
  }

  async processPushNotifyTemplate(
    tmplData: PushTemplateDto,
    varsData: PushVariableDto[],
    execData: SendPushOptionsDto,
  ): Promise<ProcessPushDto> {
    let pushTitle = tmplData?.title || '';
    let pushMessage = tmplData?.message || '';

    const keyValuePair: DynamicKeyMixDto = {};
    let keyValueData: DynamicKeyAnyDto = {};

    if (_.isArray(varsData) && varsData.length > 0) {
      if (_.isObject(execData?.params)) {
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
            pushTitle = pushTitle.replace(regex, keyValue);
            pushMessage = pushMessage.replace(regex, keyValue);
          }
        }
      }
    }

    const processedData: ProcessPushDto = {
      push_title: pushTitle,
      push_message: pushMessage,
      key_values: keyValuePair,
    };
    return processedData;
  }

  async processPushNotification(
    code: string,
    data: SendPushOptionsDto,
    params: SendPushParamsDto,
  ): Promise<boolean> {
    let success;
    try {
      if (!code) {
        throw new Error('Push notify template is missing');
      }
      if (!_.isObject(data) || _.isEmpty(data)) {
        throw new Error('Parameters object is empty');
      }
      if (!('device_token' in data)) {
        throw new Error('Device token is empty');
      }

      const pushTemplate: PushTemplateDto = await this.getPushNotifyByCode(
        code,
      );

      const pushVariables: PushVariableDto[] = pushTemplate?.varsJson;
      const processedData: ProcessPushDto =
        await this.processPushNotifyTemplate(pushTemplate, pushVariables, data);

      const pushTitle: string = processedData.push_title;
      const pushMessage: string = processedData.push_message;
      const pushSound: string = data?.sound || pushTemplate?.sound;
      const pushBadge: number = data?.badge || pushTemplate?.badge;
      const pushImage: string = data?.image || pushTemplate?.image;
      const pushColor: string = data?.color || pushTemplate?.color;
      const pushSilent: SILENT = data?.silent || pushTemplate?.silent;
      const pushPriority: string = data?.priority || pushTemplate?.priority;
      const pushCollapseKey: string =
        data?.collapse_key || pushTemplate?.collapseKey;
      const pushSendInterval: number =
        data?.send_after || pushTemplate?.sendInterval;
      const pushExpireInterval: number =
        data?.expire_after || pushTemplate?.expireInterval;

      const pushOptions: SendPushOptionsDto = {
        device_token: data.device_token,
        code: data.code,
        title: pushTitle,
        message: pushMessage,
        sound: pushSound,
        badge: pushBadge,
        image: pushImage,
        color: pushColor,
        silent: pushSilent,
        priority: pushPriority,
        collapse_key: pushCollapseKey,
        send_after: pushSendInterval,
        expire_after: pushExpireInterval,
        send_mode: data.send_mode,
        async: data?.async,
      };
      const dataParams: SendPushParamsDto = _.isObject(params)
        ? { ...params }
        : {};
      dataParams.template_title = pushTemplate?.templateTitle;
      dataParams.template_code = pushTemplate?.templateCode;

      success = await this.insertPushNotification(pushOptions, dataParams);
    } catch (err) {
      this.log.error('[processPushNotification] >> Error', err);
      success = 0;
    }
    return success;
  }

  async insertPushNotification(
    options: SendPushOptionsDto,
    params: SendPushParamsDto,
  ): Promise<boolean> {
    let success;
    try {
      let sendType: string = await this.cacheService.get(
        'PUSH_NOTIFY_SENDING_TYPE',
      );
      if ('send_mode' in options && options?.send_mode) {
        sendType = options.send_mode;
      }
      options.send_mode = sendType;

      await this.logPushNotification(options, params);
    } catch (err) {
      success = 0;
      this.log.error('[insertPushNotification] >> Error ', err);
    }
    return success;
  }

  async sendPushNotification(
    options: SendPushObjectDto,
    tokensList,
  ): Promise<StandardReturnDto> {
    let success;
    let message;

    try {
      const settingsFilePath = this.configService.get(
        'app.settings_files_path',
      );

      const iosKeyFileName = await this.cacheService.get(
        'PUSH_NOTIFY_PEM_FILE',
      );
      const iosKeyFilePath = `${settingsFilePath}${iosKeyFileName}`;

      const iosKeyId = await this.cacheService.get('PUSH_NOTIFY_IOS_KEY_ID');
      const iosTeamId = await this.cacheService.get('PUSH_NOTIFY_IOS_TEAM_ID');
      const iosPassPhrase = await this.cacheService.get('PUSH_NOTIFY_IOS_KEY');
      const iosSendingMode = await this.cacheService.get(
        'PUSH_NOTIFY_SENDING_MODE',
      );
      const iosProduction = iosSendingMode !== 'sandbox';
      const adFCMKey = await this.cacheService.get('PUSH_NOTIFY_ANDROID_KEY');

      const pushInstance = new Notification({
        gcm: {
          id: adFCMKey,
        },
        apn: {
          token: {
            key: iosKeyFilePath,
            keyId: iosKeyId,
            teamId: iosTeamId,
          },
          production: iosProduction,
          passphrase: iosPassPhrase || null,
        },
        isAlwaysUseFCM: false,
      });

      if ('async' in options && options.async === false) {
        const result: StandardPromiseDto = await new Promise(
          (resolve, reject) => {
            pushInstance.send(tokensList, options, (error, info) => {
              const sendStatus: StandardPromiseDto = {};
              if (error) {
                sendStatus.success = 0;
                sendStatus.message = 'Push notification sending failed';
                sendStatus.error = error;
              } else if (_.isArray(info) && info[0].success === 0) {
                sendStatus.success = 0;
                sendStatus.message = 'Push notification sending failed';
                sendStatus.error = info;
              } else {
                sendStatus.success = 1;
                sendStatus.message = 'Push notification sent successfully';
                sendStatus.data = info;
              }

              resolve(sendStatus);
            });
          },
        );

        if (!result?.success) {
          throw new Error(JSON.stringify(result.error[0].message));
        }
      } else {
        pushInstance.send(tokensList, options, (error, info) => {
          const sendStatus: StandardPromiseDto = {};
          if (error) {
            sendStatus.success = 0;
            sendStatus.message = 'Push notification sending failed';
            sendStatus.error = error;
          } else if (_.isArray(info) && info[0].success === 0) {
            sendStatus.success = 0;
            sendStatus.message = 'Push notification sending failed';
            sendStatus.error = info;
          } else {
            sendStatus.success = 1;
            sendStatus.message = 'Push notification sent successfully';
            sendStatus.data = info;
          }

          if (sendStatus?.success) {
            this.handlePushCallBack(null, sendStatus.data, options.id);
          } else {
            this.handlePushCallBack(
              JSON.stringify(sendStatus.error[0].message),
              null,
              options.id,
            );
          }
        });
      }
      success = 1;
    } catch (err) {
      success = 0;
      message = err;
      this.log.error('[sendPushNotification] >> Error ', err);
    }
    return {
      success: success,
      message: message,
    };
  }

  async logPushNotification(
    options: SendPushOptionsDto & PushSendJsonDto,
    params: SendPushParamsDto,
  ): Promise<StandardReturnDto> {
    let success = 1;
    let message = '';
    try {
      const sendingMode: string = await this.cacheService.get(
        'PUSH_NOTIFY_SENDING_MODE',
      );

      if (!('device_token' in options)) {
        throw new Error('Device token is empty');
      }
      if (!('message' in options)) {
        throw new Error('Message is empty');
      }

      let tokensList;
      if (_.isString(options?.device_token) && options?.device_token) {
        if (options?.device_token.indexOf(',') >= 0) {
          tokensList = options.device_token.split(',');
        } else {
          tokensList = [options.device_token];
        }
      }

      const notifyData: SendPushObjectDto = {
        title: options?.title,
        body: options?.message,
        alert: {
          title: options?.title,
          body: options?.message,
        },
      };
      notifyData.topic = await this.cacheService.get(
        'PUSH_NOTIFY_IOS_BUNDLE_ID',
      );
      if ('sound' in options && options.sound) {
        notifyData.sound = options.sound;
      }
      if ('badge' in options && Number(options.badge) >= 0) {
        notifyData.badge = Number(options.badge);
      }
      if ('image' in options && options.image) {
        notifyData.image = options.image;
      }
      if ('icon' in options && options.icon) {
        notifyData.icon = options.icon;
      }
      if ('color' in options && options.color) {
        notifyData.color = options.color;
      }
      if ('priority' in options && options.priority) {
        notifyData.priority = options.priority;
      }
      if ('collapse_key' in options && options.collapse_key) {
        notifyData.collapseKey = options.collapse_key;
      }
      if ('silent' in options && options.silent === 'Yes') {
        notifyData.contentAvailable = true;
      }
      if ('expire_after' in options && Number(options.expire_after) > 0) {
        notifyData.expire =
          Math.floor(Date.now() / 1000) + Number(options.expire_after);
      }
      notifyData.custom = {};
      if ('data' in options && _.isObject(options.data)) {
        notifyData.custom = options.data;
      }
      if ('code' in options && options.code) {
        notifyData.custom.code = options.code;
      }
      notifyData.async = options.async;

      const queryColumns: PushLoggerDto = {
        deviceId: options.device_token,
        mode: sendingMode === 'sandbox' ? MODE.SANDBOX : MODE.LIVE,
        type: TYPE.API,
        notifyCode: options?.code,
        title: options.title,
        message: options.message,
        sound: options?.sound,
        badge: options?.badge,
        silent: options?.silent,
        image: options?.image,
        color: options?.color,
        priority: options?.priority,
        collapseKey: options?.collapse_key,
      };

      if (params?.template_code) {
        queryColumns.code = params.template_code;
      }
      if ('data' in options && _.isObject(options.data)) {
        queryColumns.varsJSON = JSON.stringify(options.data);
      }
      if ('payload' in options && _.isObject(options.payload)) {
        queryColumns.sendJSON = JSON.stringify(options.payload);
      }

      if (Number(options.send_after) > 0) {
        queryColumns.pushTime = this.dateService.getDateTimeAfter(
          Number(options.send_after),
        );
      }
      if ('expire_after' in options && Number(options.expire_after) > 0) {
        queryColumns.expireTime = this.dateService.getDateTimeAfter(
          Number(options.expire_after),
        );
        queryColumns.expireInterval = Number(options.expire_after);
      }
      if (options.device_token.length > 64) {
        queryColumns.deviceType = DEVICE.ANDROID;
      } else {
        queryColumns.deviceType = DEVICE.IOS;
      }

      queryColumns.status = STATUS.PENDING;

      const queryObject = this.pushNotifyLogsRepository.create(queryColumns);
      let res = await this.pushNotifyLogsRepository.save(queryObject);

      notifyData.id = res.id;

      const sendPriority =
        'priority' in options && options.priority !== ''
          ? options.priority
          : 'default';

      const is_queue_enabled = this.configService.get(
        'app.enable_notification_queue',
      );

      if (sendPriority == 'immediate' || !is_queue_enabled) {
        let res = await this.sendPushNotification(notifyData, tokensList);
        if ('async' in options && options.async === false) {
          if (res.success == 1) {
            this.handlePushCallBack(null, res.message, notifyData.id);
          } else {
            this.handlePushCallBack(res.message, null, notifyData.id);
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

        let option_data: PushNotifyConsumerInputDto = {
          notify_data: notifyData,
          token_list: tokensList,
        };

        const resultdata = await this.pushQueue.add('push-task', option_data, {
          priority: priority,
        });

        message = 'Email notification registered.';
      }

      this.log.debug(`[logPushNotification] >> Push notify logging completed`);
    } catch (err) {
      this.log.error('[logPushNotification] >> Error ', err);
    }

    return { success: success, message: message };
  }

  async handlePushCallBack(error: any, info: any, notification_id: number) {
    const queryColumns: any = {};
    queryColumns.status = error === null ? STATUS.EXECUTED : STATUS.FAILED;
    queryColumns.executedAt = this.dateService.getCurrentDateTime();
    if (error != null) {
      queryColumns.error = error.toString();
    }

    const queryObject = this.pushNotifyLogsRepository
      .createQueryBuilder()
      .update(PushNotificationsEntity)
      .set(queryColumns);
    queryObject.andWhere('id = :id', { id: notification_id });
    await queryObject.execute();
    return true;
  }
}
