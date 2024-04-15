import { Injectable } from '@nestjs/common';

import { Buffer } from 'buffer';
import * as crypto from 'crypto';
import * as _ from 'lodash';

import { LoggerHandler } from './logger-handler';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { CacheService } from 'src/services/cache.service';
import { DateService } from 'src/services/date.service';
import { EmailService } from 'src/services/email.service';
import { EncryptService } from 'src/services/encrypt.service';
import { FileService } from 'src/services/file.service';
import { HttpService } from 'src/services/http.service';
import { JwtTokenService } from 'src/services/jwt-token.service';
import { PushNotifyService } from 'src/services/pushnotify.service';
import { SmsService } from 'src/services/sms.service';

import * as custom from './custom-helper';
import { cryptoDigest } from 'src/common/types/common.type';
import { DateTimeParamsDto } from 'src/common/dto/general.dto';
import { SendEmailOptionsDto } from 'src/common/dto/email-notify.dto';
import {
  DynamicKeyAnyDto,
  DynamicKeyMixDto,
  StandardCallbackDto,
} from 'src/common/dto/common.dto';
import { SendPushOptionsDto } from 'src/common/dto/push-notify.dto';
import { SendSmsOptionsDto } from 'src/common/dto/sms-notify.dto';
import { ImageResizeDto, ResizeOptionsDto } from 'src/common/dto/amazon.dto';

import apiConfig from 'src/config/cit-api-config';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GeneralLibrary {
  protected readonly log = new LoggerHandler(GeneralLibrary.name).getInstance();

  constructor(
    protected readonly cacheService: CacheService,
    protected readonly dateService: DateService,
    protected readonly emailService: EmailService,
    protected readonly encryptService: EncryptService,
    protected readonly fileService: FileService,
    protected readonly jwtTokenService: JwtTokenService,
    protected readonly pushService: PushNotifyService,
    protected readonly smsService: SmsService,
    protected readonly configService: ConfigService,
    protected readonly httpService: HttpService,
  ) {}

  escape(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\//g, '&#x2F;')
      .replace(/\\/g, '&#x5C;')
      .replace(/`/g, '&#96;');
  }

  getRandomNumber = (length) => {
    length = length > 0 ? length : 16;
    return custom.getRandomNumber(length);
  };

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

  parse(str: string): any {
    let arr = [];
    try {
      arr = JSON.parse(str);
    } catch (err) {
      this.log.error(`[parse] -> ${err.message}`);
    }
    return arr;
  }

  stringify(arr: any): string {
    let str = '';
    try {
      str = JSON.stringify(arr);
    } catch (err) {
      this.log.error(`[stringify] -> ${err.message}`);
    }
    return str;
  }

  // Date related functions
  async getDateTime(
    type?: string,
    params?: DateTimeParamsDto,
  ): Promise<string | number> {
    let value: string | number;
    switch (type) {
      case 'date':
        value = this.dateService.getCurrentDate();
        break;
      case 'time':
        value = this.dateService.getCurrentTime();
        break;
      case 'datetime':
        value = this.dateService.getCurrentDateTime();
        break;
      case 'timestamp':
        value = this.dateService.getCurrentTimeStamp();
        break;
      case 'timems':
        value = this.dateService.getCurrentTimeMS();
        break;
      case 'datetime_before':
        value = this.dateService.getDateTimeBefore(params.value, params.type);
        break;
      case 'datetime_after':
        value = this.dateService.getDateTimeAfter(params.value, params.type);
        break;
      case 'sys_date':
        value = await this.dateService.getDateSystemFormat(params.value);
        break;
      case 'sys_time':
        value = await this.dateService.getTimeSystemFormat(params.value);
        break;
      case 'sys_datetime':
        value = await this.dateService.getDateTimeSystemFormat(params.value);
        break;
      case 'cus_date':
        value = this.dateService.getDateCustomFormat(
          params.value,
          params.format,
        );
        break;
      case 'cus_time':
        value = this.dateService.getTimeCustomFormat(
          params.value,
          params.format,
        );
        break;
      case 'cus_datetime':
        value = this.dateService.getDateTimeCustomFormat(
          params.value,
          params.format,
        );
        break;
      default:
        break;
    }
    return value;
  }

  isValidDate(val?: string): boolean {
    if (!val || ['0000-00-00', '0000-00-00 00:00:00'].includes(val)) {
      return false;
    }
    if (!this.dateService.isValidDate(val)) {
      return false;
    }
    return true;
  }

  isValidTime(val?: string): boolean {
    if (!val || val === '00:00:00') {
      return false;
    }
    if (!this.dateService.isValidTime(val)) {
      return false;
    }
    return true;
  }

  getDateDiff(
    dateLeft: number | string | Date,
    dateRight: number | string | Date,
    type?: string,
  ): number {
    return this.dateService.diff(dateLeft, dateRight, type);
  }

  compareDate(dateLeft: number | Date, dateRight: number | Date): number {
    return this.dateService.compare(dateLeft, dateRight);
  }

  async getSystemFormat(type?: string): Promise<string> {
    let value: string;
    switch (type) {
      case 'date':
        const dateFormat = await this.cacheService.get('ADMIN_DATE_FORMAT');
        value = this.dateService.getSystemDateFormat(dateFormat);
        break;
      case 'time':
        const timeFormat = await this.cacheService.get('ADMIN_TIME_FORMAT');
        value = this.dateService.getSystemTimeFormat(timeFormat);
        break;
      case 'datetime':
        const dateTimeFormat = await this.cacheService.get(
          'ADMIN_DATE_TIME_FORMAT',
        );
        value = this.dateService.getSystemTimeFormat(dateTimeFormat);
        break;
      default:
        break;
    }
    return value;
  }

  // Files related functions
  isFile(filePath: string) {
    return this.fileService.isFile(filePath);
  }

  isDirectory(dirPath: string) {
    return this.fileService.isDirectory(dirPath);
  }

  createFolder(dirPath: string, mode?: number) {
    return this.fileService.createFolder(dirPath, mode);
  }

  getFileSize(filePath: string): number {
    return this.fileService.getFileSize(filePath);
  }

  getFileMime(filePath: string): string {
    return this.fileService.getFileMime(filePath);
  }

  readURLName(filePath: string) {
    return this.fileService.readURLName(filePath);
  }

  readFile(filePath: string, options?: StandardCallbackDto) {
    return this.fileService.readFile(filePath, options);
  }

  writeFile(filePath: string, data: string, options?: StandardCallbackDto) {
    return this.fileService.writeFile(filePath, data, options);
  }

  deleteFile(filePath: string, options?: StandardCallbackDto) {
    return this.fileService.deleteFile(filePath, options);
  }

  getFile(options: any, params?: DynamicKeyAnyDto) {
    return this.fileService.getFile(options);
  }

  uploadFile(options: any, params?: DynamicKeyAnyDto) {
    this.fileService.uploadFile(options);
  }

  deleteAzureFile(options: any, params?: DynamicKeyAnyDto) {
    this.fileService.deleteAzureFile(options);
  }

  imageUpload(options: any, params?: DynamicKeyAnyDto) {
    return this.fileService.imageUpload(options);
  }

  getFileAttributes(fileName: string) {
    return this.fileService.getFileAttributes(fileName);
  }

  getBase64ImageName(imageData: string) {
    return this.fileService.getBase64ImageName(imageData);
  }

  validateFileSize(fSize: number, mSize: number): boolean {
    return this.fileService.validateFileSize(fSize, mSize);
  }

  validateFileFormat(allowedExt: string, file: string): boolean {
    return this.fileService.validateFileFormat(allowedExt, file);
  }

  async getResizeImageUrl(
    url: string,
    wh: number,
    ht: number,
    opts: ResizeOptionsDto,
  ): Promise<string> {
    return await this.fileService.getResizeImageUrl(url, wh, ht, opts);
  }

  async getResizedImage(opts: ImageResizeDto): Promise<void> {
    await this.fileService.getResizedImage(opts);
  }

  async writeURLData(
    fileUrl: string,
    filePath?: string,
    headers?: DynamicKeyAnyDto,
    options?: StandardCallbackDto & ImageResizeDto,
  ) {
    return await this.fileService.writeURLData(
      fileUrl,
      filePath,
      headers || {},
      options || {},
    );
  }

  async encryptData(data: string, method: string) {
    method = method || 'cit';
    let encData: string | boolean = '';
    if (custom.isEmpty(data)) {
      return encData;
    }
    switch (method) {
      case 'base64':
        encData = Buffer.from(data).toString('base64');
        break;
      case 'password_hash':
      case 'bcrypt':
        if (data === '******') {
          encData = false;
        } else {
          encData = custom.getPasswordHash(data);
        }
        break;
      case 'md5':
      case 'sha1':
      case 'sha256':
      case 'sha512':
        encData = this.getHashChecksum(data, method);
        break;
      default:
        encData = await this.encryptService.encryptContent(data);
        break;
    }
    return encData;
  }

  async decryptData(data: string, method: string) {
    method = method || 'cit';
    let decData = '';
    if (custom.isEmpty(data)) {
      return decData;
    }
    switch (method) {
      case 'base64':
        if (_.isString(data)) {
          decData = Buffer.from(data, 'base64').toString('utf8');
        }
        break;
      case 'password_hash':
      case 'bcrypt':
      case 'md5':
      case 'sha1':
      case 'sha256':
      case 'sha512':
        if (_.isString(data)) {
          decData = '******';
        }
        break;
      default:
        decData = await this.encryptService.decryptContent(data);
        break;
    }
    return decData;
  }

  verifyEncrypted(data: string, encData: string, method: string) {
    method = method || 'cit';
    let isMatched = false;
    if (custom.isEmpty(data) || custom.isEmpty(encData)) {
      return isMatched;
    }
    let decData;
    switch (method) {
      case 'base64':
        decData = Buffer.from(encData, 'base64').toString('utf8');
        if (data === decData) {
          isMatched = true;
        }
        break;
      case 'password_hash':
      case 'bcrypt':
        isMatched = custom.comparePasswordHash(data, encData);
        break;
      case 'md5':
      case 'sha1':
      case 'sha256':
      case 'sha512':
        decData = this.getHashChecksum(data, method);
        if (decData === encData) {
          isMatched = true;
        }
        break;
      default:
        decData = this.encryptService.decryptContent(data);
        if (decData === encData) {
          isMatched = true;
        }
        break;
    }
    return isMatched;
  }

  getHashChecksum(str: string, algorithm?: string, encoding?: cryptoDigest) {
    return crypto
      .createHash(algorithm || 'md5')
      .update(str, 'utf8')
      .digest(encoding || 'hex');
  }

  async sendMailNotification(
    data?: SendEmailOptionsDto,
    code?: string,
    params?: DynamicKeyAnyDto,
  ): Promise<number> {
    let success: number;
    if (!code) {
      success = await this.emailService.registerEmail(data, params);
    } else {
      success = await this.emailService.processMail(code, data, params);
    }
    return success;
  }

  async sendPushNotification(
    data?: SendPushOptionsDto,
    code?: string,
    params?: DynamicKeyAnyDto,
  ): Promise<boolean> {
    let success: boolean;
    if (!code) {
      success = await this.pushService.insertPushNotification(data, params);
    } else {
      success = await this.pushService.processPushNotification(
        code,
        data,
        params,
      );
    }
    return success;
  }

  async sendSMSNotification(
    data?: SendSmsOptionsDto,
    code?: string,
    params?: DynamicKeyAnyDto,
  ): Promise<number> {
    let success: number;
    if (!code) {
      success = await this.smsService.registerSMSNotification(data, params);
    } else {
      success = await this.smsService.processSMS(code, data, params);
    }
    return success;
  }

  async createAPIToken(apiName: string, result: any) {
    if (
      _.isObject(apiConfig[apiName]) &&
      'action' in apiConfig[apiName] &&
      ['create', 'verify-create', 'optional-create'].includes(
        apiConfig[apiName].action,
      )
    ) {
      if (
        'settings' in result &&
        'success' in result.settings &&
        result.settings.success
      ) {
        const response = await this.jwtTokenService.createAPIToken(
          apiName,
          apiConfig,
          result.data,
        );
        if (response.success) {
          result.settings.access_token = response.token;
          if ('data' in result && _.isObject(result.data)) {
            result.data.access_token = response.token;
          }
        }
      }
    }
    return result;
  }

  async getConfigItem(key: string) {
    let val = null;
    const configVal = await this.cacheService.get(key);
    if (configVal !== null && configVal !== undefined) {
      val = configVal;
    } else if (key in this.configService.get('app')) {
      val = this.configService.get(`app.${key}`);
    }
    return val;
  }

  async temporaryUpload(file: Express.Multer.File): Promise<string> {
    const file_path = await this.getConfigItem('upload_temp_path');
    if (!existsSync(file_path)) {
      mkdirSync(file_path);
    }

    const fileProp = await this.getFileAttributes(file.originalname);
    const fileName = fileProp.file_name;
    const tempFilePath = `${file_path}${fileName}`;

    const writableStream = createWriteStream(tempFilePath);
    await new Promise<void>((resolve, reject) => {
      writableStream.on('finish', resolve).on('error', reject);
      writableStream.write(file.buffer);
      writableStream.end();
    });
    return fileName;
  }

  evalExpression(expr) {
    return custom.evaluateExpression(expr);
  }

  executeExternalAPI = async (options, params) => {
    let apiResult: any;
    const apiUrl = options.api_url;
    const apiParams = options.request_params || {};
    const apiHeaders = options.request_headers || {};
    const apiOptions: any = {};
    if ('async' in options) {
      apiOptions.async = options.async;
    }
    switch (options.api_method) {
      case 'post':
        if ('input_type' in options) {
          apiOptions.input_type = options.input_type;
        }
        if ('post_file_keys' in options) {
          apiOptions.file_keys = options.post_file_keys;
        }
        apiResult = await this.httpService.post(
          apiUrl,
          apiParams,
          apiHeaders,
          apiOptions,
        );
        break;
      case 'put':
        if ('input_type' in options) {
          apiOptions.input_type = options.input_type;
        }
        apiResult = await this.httpService.put(
          apiUrl,
          apiParams,
          apiHeaders,
          apiOptions,
        );
        break;
      case 'delete':
        if ('input_type' in options) {
          apiOptions.input_type = options.input_type;
        }
        apiResult = await this.httpService.delete(
          apiUrl,
          apiParams,
          apiHeaders,
          apiOptions,
        );
        break;
      default:
        apiResult = await this.httpService.get(
          apiUrl,
          apiParams,
          apiHeaders,
          apiOptions,
        );
        break;
    }
    const retResult = this.httpService.process(apiResult, options, params);
    return retResult;
  };
}
