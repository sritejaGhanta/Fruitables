import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

import * as _ from 'lodash';

import { LoggerHandler } from 'src/utilities/logger-handler';
import { CacheService } from 'src/services/cache.service';
import { DateService } from './date.service';

import { EmailNotifyTemplateEntity } from 'src/entities/email-notify-template.entity';
import { EmailNotificationsEntity } from 'src/entities/email-notifications.entity';

import {
  EmailConfigVarsDto,
  EmailLoggerDto,
  EmailTemplateDto,
  EmailVariableDto,
  ProcessEmailDto,
  SendEmailObjectDto,
  SendEmailOptionsDto,
  SendEmailParamsDto,
} from 'src/common/dto/email-notify.dto';
import {
  DynamicKeyAnyDto,
  DynamicKeyMixDto,
  StandardPromiseDto,
  StandardReturnDto,
} from 'src/common/dto/common.dto';
import { STATUS, TYPE } from 'src/common/enum/common.enum';

@Injectable()
export class EmailService {
  private readonly log = new LoggerHandler(EmailService.name).getInstance();

  constructor(
    private readonly mailerService: MailerService,
    private readonly cacheService: CacheService,
    private readonly dateService: DateService,
    @InjectRepository(EmailNotifyTemplateEntity)
    private emailNotifyTmplRepository: Repository<EmailNotifyTemplateEntity>,
    @InjectRepository(EmailNotificationsEntity)
    private emailNotifyLogsRepository: Repository<EmailNotificationsEntity>,
    protected readonly configService: ConfigService,
    @InjectQueue('email-queue') private emailQueue: Queue,
  ) {}

  unescape(str: string): string {
    return str
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#x2F;/g, '/')
      .replace(/&#x5C;/g, '\\')
      .replace(/&#96;/g, '`');
  }

  async getTemplateByCode(code: string): Promise<EmailTemplateDto> {
    let template: EmailTemplateDto;
    try {
      template = await this.emailNotifyTmplRepository.findOne({
        where: { emailCode: code },
      });
      if (!_.isObject(template) || _.isEmpty(template)) {
        throw new Error('Email template not found.');
      }
    } catch (err) {
      this.log.error('[getTemplateByCode] >> ', err);
    }
    return template;
  }

  async getTemplateVars(): Promise<EmailConfigVarsDto> {
    const apiURL = await this.cacheService.get('API_URL');
    const siteUrl = await this.cacheService.get('SITE_URL');
    const siteLogo = await this.cacheService.get('COMPANY_LOGO');
    const logoUrl = `${this.configService.get(
      'app.settings_files_url',
    )}${siteLogo}`;

    const currentYear: number = new Date().getFullYear();
    const companyName = await this.cacheService.get('COMPANY_NAME');
    let copyRightText = await this.cacheService.get('COPYRIGHTED_TEXT');
    copyRightText = copyRightText.replace('#COMPANY_NAME#', companyName);
    copyRightText = copyRightText.replace(
      '#CURRENT_YEAR#',
      String(currentYear),
    );

    const params: EmailConfigVarsDto = {
      company_name: companyName,
      copyright_text: copyRightText,
      site_url: siteUrl,
      logo: `${apiURL}/${logoUrl}`,
    };
    return params;
  }

  async processTemplate(
    tmplData: EmailTemplateDto,
    varsData: EmailVariableDto[],
    execData: SendEmailOptionsDto,
  ): Promise<ProcessEmailDto> {
    let emailSubject: string;
    if ('email_subject' in execData && execData.email_subject) {
      emailSubject = execData.email_subject;
    } else {
      emailSubject = tmplData.emailSubject || '';
    }

    let emailMessage: string = tmplData.emailMessage || '';
    emailMessage = emailMessage.replace(/\\(.)/gm, '$1').trim();

    let fromName: string;
    if ('from_name' in execData && execData.from_name) {
      fromName = execData.from_name;
    } else {
      fromName = tmplData.fromName;
    }

    if (!fromName) {
      fromName = await this.cacheService.get('COMPANY_NAME');
    }

    let fromEmail: string;
    if ('from_email' in execData && execData.from_email) {
      fromEmail = execData.from_email;
    } else {
      fromEmail = tmplData.fromEmail;
    }

    if (!fromEmail) {
      fromEmail = await this.cacheService.get('NOTIFICATION_EMAIL');
    }

    console.log(fromName, '=============fromName');
    console.log(fromEmail, '===============fromEmail');

    const keyValuePair: DynamicKeyMixDto = {};
    let keyValueData: DynamicKeyAnyDto = {};
    if (_.isArray(varsData) && varsData.length > 0) {
      if (_.isObject(execData?.params)) {
        keyValueData = execData?.params;
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
            emailSubject = emailSubject.replace(regex, keyValue);
            emailMessage = emailMessage.replace(regex, keyValue);
            fromName = fromName.replace(regex, keyValue);
            fromEmail = fromEmail.replace(regex, keyValue);
          }
        }
      }
    }
    const processedData: ProcessEmailDto = {
      email_subject: emailSubject,
      email_message: emailMessage,
      from_name: fromName,
      from_email: fromEmail,
      key_values: keyValuePair,
    };
    return processedData;
  }

  async processMail(
    code: string,
    data: SendEmailOptionsDto,
    params: SendEmailParamsDto,
  ): Promise<number> {
    let success;
    try {
      if (!code) {
        throw new Error('Email template is missing');
      }
      if (!_.isObject(data) || _.isEmpty(data)) {
        throw new Error('Parameters object is empty');
      }
      if (!('to_email' in data)) {
        throw new Error('Receiver email is empty');
      }

      const mailTemplate: EmailTemplateDto = await this.getTemplateByCode(code);
      const mailVariables: EmailVariableDto[] = mailTemplate?.varsJson;

      const processedData: ProcessEmailDto = await this.processTemplate(
        mailTemplate,
        mailVariables,
        data,
      );

      const toEmail: string = data?.to_email;
      const fromName: string = processedData?.from_name;
      const fromEmail: string = processedData?.from_email;
      const emailSubject: string = processedData?.email_subject;
      const emailMessage = this.unescape(processedData.email_message);

      let ccEmail: string;
      if ('cc_email' in data && data.cc_email) {
        ccEmail = data.cc_email;
      } else if ('vCcEmail' in mailTemplate && mailTemplate.ccEmail) {
        ccEmail = mailTemplate.ccEmail;
      }

      let bccEmail: string;
      if ('bcc_email' in data && data.bcc_email) {
        bccEmail = data.bcc_email;
      } else if ('vBccEmail' in mailTemplate && mailTemplate.bccEmail) {
        bccEmail = mailTemplate.bccEmail;
      }

      let replyToName: string;
      if ('replyto_name' in data && data.replyto_name) {
        replyToName = data.replyto_name;
      } else if ('vReplyToName' in mailTemplate && mailTemplate.replyToName) {
        bccEmail = mailTemplate.replyToName;
      }

      let replyToEmail: string;
      if ('replyto_email' in data && data.replyto_email) {
        replyToEmail = data.replyto_email;
      } else if ('vReplyToEmail' in mailTemplate && mailTemplate.replyToEmail) {
        bccEmail = mailTemplate.replyToEmail;
      }

      // TODO: Testing pending
      let emailAttachments = null;
      if ('attachments' in data && _.isArray(data.attachments)) {
        emailAttachments = data.attachments;
      }

      const keyValues = processedData?.key_values;
      const emailOptions: SendEmailOptionsDto = {
        to_email: toEmail,
        cc_email: ccEmail,
        bcc_email: bccEmail,
        from_name: fromName,
        from_email: fromEmail,
        replyto_name: replyToName,
        replyto_email: replyToEmail,
        email_subject: emailSubject,
        email_message: emailMessage,
        attachments: emailAttachments,
        variables: keyValues,
        callback: data?.callback,
        async: data?.async,
        new_priority: data?.new_priority,
      };

      const dataParams: SendEmailParamsDto = _.isObject(params)
        ? { ...params }
        : {};
      dataParams.email_title = mailTemplate?.emailTitle;
      dataParams.email_code = mailTemplate?.emailCode;

      success = await this.registerEmail(emailOptions, dataParams);
    } catch (err) {
      console.log(err);

      success = 0;
      this.log.error('[processMail] >> Error ', err);
    }
    return success;
  }

  async handleMailCallBack(error: any, info: any, notification_id: number) {
    const queryColumns: any = {};
    queryColumns.status = error === null ? STATUS.EXECUTED : STATUS.FAILED;
    queryColumns.executedAt = this.dateService.getCurrentDateTime();
    if (error != null) {
      queryColumns.error = error.toString();
    }

    const queryObject = this.emailNotifyLogsRepository
      .createQueryBuilder()
      .update(EmailNotificationsEntity)
      .set(queryColumns);
    queryObject.andWhere('id = :id', { id: notification_id });
    await queryObject.execute();
    return true;
  }

  async sendMail(options: SendEmailObjectDto): Promise<StandardReturnDto> {
    let success;
    let message;
    try {
      if (!('to' in options) || options.to === '') {
        throw new Error('Receiver email address is missing..!');
      }

      if ('async' in options && options.async === false) {
        const result: StandardPromiseDto = await new Promise(
          (resolve, reject) => {
            this.mailerService
              .sendMail(options)
              .then((data) => {
                resolve({
                  success: 1,
                  message: 'Email sent successfully',
                  data,
                });
              })
              .catch((error) => {
                resolve({
                  success: 0,
                  message: 'Email sending failed',
                  error,
                });
              });
          },
        );

        if (result?.error) {
          throw new Error(result.error);
        }
      } else {
        this.mailerService
          .sendMail(options)
          .then((info) => {
            this.handleMailCallBack(null, info, options.id);
            if (options?.callback) {
              options.callback(null, info, options.id);
            }
          })
          .catch((error) => {
            this.log.error('[sendMail] >> Catch ', error);
            this.handleMailCallBack(error, null, options.id);
            if (options?.callback) {
              options.callback(error, null, options.id);
            }
          });
      }

      success = 1;
    } catch (err) {
      success = 0;
      message = err;
      this.log.error('[sendMail] >> Error ', err);
    }
    return {
      success: success,
      message: message,
    };
  }

  async logEmail(
    options: SendEmailObjectDto,
    params: SendEmailParamsDto,
  ): Promise<StandardReturnDto> {
    const sendPriority =
      'new_priority' in options && options.new_priority !== ''
        ? options.new_priority
        : 'default';

    let success = 1;
    let message = '';
    try {
      const miscJSON = {
        from_email: options?.from,
        from_name: options.to,
        replyto_email: options?.replyTo,
        replyto_name: options?.inReplyTo,
        cc_email: options?.cc,
        bcc_email: options?.bcc,
        attachments: options?.attachments,
        variables: options?.variables,
      };

      const queryColumns: EmailLoggerDto = {
        receiver: options.to,
        subject: options?.subject,
        content: options?.context?.content,
        type: TYPE.API,
      };
      queryColumns.params = JSON.stringify(miscJSON);

      if (params.email_code) {
        queryColumns.code = params.email_code;
      }

      const queryObject = this.emailNotifyLogsRepository.create(queryColumns);
      let resdata = await this.emailNotifyLogsRepository.save(queryObject);

      const is_queue_enabled = this.configService.get(
        'app.enable_notification_queue',
      );

      options.id = resdata.id;
      if (sendPriority == 'immediate' || !is_queue_enabled) {
        let res = await this.sendMail(options);
        if ('async' in options && options.async === false) {
          if (res.success == 1) {
            this.handleMailCallBack(null, res.message, options.id);
          } else {
            this.handleMailCallBack(res.message, null, options.id);
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

        await this.emailQueue.add('email-task', options, {
          priority: priority,
        });

        message = 'Email notification registered.';
      }

      this.log.debug(`[logEmail] >> Email logging completed`);

      success = 1;
      message = 'Email logging completed';
    } catch (err) {
      success = 0;
      message = err;
      this.log.error('[logEmail] >> Error ', err);
    }

    return { success: success, message: message };
  }

  async registerEmail(
    options: SendEmailOptionsDto,
    params: SendEmailParamsDto,
  ) {
    let success = 0;
    try {
      if (!('to_email' in options) || options.to_email === '') {
        throw new Error('Receiver email address is missing..!');
      }
      if (!('email_message' in options) || options.email_message === '') {
        throw new Error('Email body content is missing..!');
      }

      const tmplVariables: EmailConfigVarsDto = await this.getTemplateVars();
      const notifyEmail = await this.cacheService.get('NOTIFICATION_EMAIL');
      const companyName = await this.cacheService.get('COMPANY_NAME');

      const fromEmail: string = options?.from_email || notifyEmail;
      const fromName: string = options?.from_name || companyName;

      const mailOptions: SendEmailObjectDto = {
        to: options?.to_email,
      };
      // mailOptions.from = fromEmail;
      // mailOptions.sender = fromName || fromEmail;
      if (fromName) {
        mailOptions.from = `${fromName} <${fromEmail}>`;
      } else {
        mailOptions.from = fromEmail;
      }
      mailOptions.subject = options.email_subject || '';
      mailOptions.template = 'mail-template';
      mailOptions.context = {
        ...tmplVariables,
        ...options?.variables,
        content: options.email_message,
      };

      if ('replyto_email' in options && options.replyto_email) {
        mailOptions.replyTo = options.replyto_email;
      } else {
        mailOptions.replyTo = fromEmail;
      }
      if ('replyto_name' in options && options.replyto_name) {
        mailOptions.inReplyTo = options.replyto_name;
      } else {
        mailOptions.inReplyTo = fromName;
      }
      if ('cc_email' in options && options.cc_email) {
        mailOptions.cc = options.cc_email;
      }
      if ('bcc_email' in options && options.bcc_email) {
        mailOptions.bcc = options.bcc_email;
      }
      if ('attachments' in options && _.isArray(options.attachments)) {
        mailOptions.attachments = options.attachments;
      }

      if ('async' in options) {
        mailOptions.async = options.async;
      }

      mailOptions.new_priority = options.new_priority;
      let result = await this.logEmail(mailOptions, params);

      if (!result?.success) {
        throw new Error(result?.message);
      }
      success = 1;
    } catch (error) {
      success = 0;
      this.log.error('[registerEmail] >> Error ', error);
    }

    return success;
  }
}
