import { Injectable } from '@nestjs/common';

import * as _ from 'lodash';
import * as crypto from 'crypto';
import * as CryptoJS from 'crypto-js';
import { isEmpty } from '../utilities/custom-helper';
import { CacheService } from './cache.service';
import { LoggerHandler } from 'src/utilities/logger-handler';
import { DynamicKeyAnyDto, StandardResultDto } from 'src/common/dto/common.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EncryptService {
  private agent: string;
  private ip: string;
  private readonly log = new LoggerHandler(EncryptService.name).getInstance();
  private excludeParams = [
    'access_token',
    'ws_checksum',
    'ws_preview',
    'ws_encrypt',
    'ws_debug',
    'ws_cache',
    'ws_ctrls',
    'ws_log',
    '_',
  ];
  private KEY = null;
  private IV = null;

  constructor(
    private cacheService: CacheService,
    protected readonly configService: ConfigService,
  ) {}

  async initialize(type: string): Promise<void> {
    let encryptKey = await this.cacheService.get('WS_ENC_KEY');
    if (type === 'content') {
      encryptKey = this.configService.get('app.dataSecret');
    }
    const saltPhrase = 'CIT';
    const iterCount = 999;
    const keyPhrase = crypto.createHash('md5').update(encryptKey).digest('hex');
    const ivPhrase = crypto
      .createHash('sha1')
      .update(encryptKey)
      .digest('hex')
      .substr(0, 16);

    this.KEY = CryptoJS.PBKDF2(keyPhrase, saltPhrase, {
      hasher: CryptoJS.algo.SHA256,
      keySize: 64 / 8,
      iterations: iterCount,
    });
    this.IV = CryptoJS.enc.Utf8.parse(ivPhrase);
  }

  async encryptData(str: string): Promise<string> {
    let output: string;
    try {
      await this.initialize('data');
      const encrypted = CryptoJS.AES.encrypt(str, this.KEY, {
        iv: this.IV,
      });
      output = encrypted.ciphertext.toString(CryptoJS.enc.Base64);
    } catch (err) {
      output = '';
      this.log.error('[encryptData] >> Error ', err);
    }
    return output;
  }

  async decryptData(str: string): Promise<string> {
    let output: string;
    try {
      await this.initialize('data');
      const decrypted = CryptoJS.AES.decrypt(str, this.KEY, {
        iv: this.IV,
      });
      output = decrypted.toString(CryptoJS.enc.Utf8);
    } catch (err) {
      output = '';
      this.log.error('[decryptData] >> Error ', err);
    }
    return output;
  }

  async encryptContent(str: string): Promise<string> {
    let output: string;
    try {
      await this.initialize('content');
      const encrypted = CryptoJS.AES.encrypt(str, this.KEY, {
        iv: this.IV,
      });
      output = encrypted.ciphertext.toString(CryptoJS.enc.Hex);
    } catch (err) {
      output = '';
      this.log.error('[encryptContent] >> Error ', err);
    }
    return output;
  }

  async decryptContent(str: string): Promise<string> {
    let output: string;
    try {
      await this.initialize('content');
      const decrypted = CryptoJS.AES.decrypt(str, this.KEY, {
        iv: this.IV,
        format: CryptoJS.format.Hex,
      });
      output = decrypted.toString(CryptoJS.enc.Utf8);
    } catch (err) {
      output = '';
      this.log.error('[decryptContent] >> Error ', err);
    }
    return output;
  }

  async decryptInputs(params: DynamicKeyAnyDto): Promise<DynamicKeyAnyDto> {
    if (!_.isObject(params) || _.isEmpty(params)) {
      return params;
    }

    const excludeList = this.excludeParams;
    excludeList.push('ws_token');
    Object.keys(params).forEach(async (key) => {
      if (!excludeList.includes(key)) {
        let val = params[key];
        if (_.isString(val)) {
          val = val.replace(/\s/g, '+');
        }
        params[key] = await this.decryptData(val);
      }
    });
    return params;
  }

  async validateRequest(params: DynamicKeyAnyDto): Promise<StandardResultDto> {
    let response: StandardResultDto = {
      success: 1,
      message: '',
    };

    const checksumEncryption = await this.cacheService.get(
      'WS_CHECKSUM_ENCRYPTION',
    );
    if (checksumEncryption === 'Y') {
      response = this.validateChecksum(params);
    }
    return response;
  }

  validateChecksum(params: DynamicKeyAnyDto): StandardResultDto {
    const response: StandardResultDto = {
      success: 1,
      message: '',
    };
    if (!_.isObject(params) || _.isEmpty(params)) {
      return response;
    }

    const excludeList = this.excludeParams;
    const sorted = {};
    Object.keys(params)
      .sort()
      .forEach((key) => {
        sorted[key] = params[key];
      });

    const data = [];
    Object.keys(sorted).forEach((key) => {
      const val = sorted[key];
      if (!isEmpty(val) && !excludeList.includes(key)) {
        const pair = `${key}=${val}`;
        data.push(pair);
      }
    });

    const reqChecksum = params['ws_checksum'] || '';
    if (!data.length && isEmpty(reqChecksum)) {
      response.success = 1;
      response.message = 'Checksum optional..!';
    } else {
      const str = data.join('');
      const genChecksum = crypto.createHash('sha1').update(str).digest('hex');
      if (isEmpty(genChecksum)) {
        response.success = -3;
        response.message = 'Checksum not found..!';
      } else if (genChecksum !== reqChecksum) {
        response.success = -3;
        response.message = 'Checksum failed..!';
      } else {
        response.success = 1;
        response.message = 'Checksum successful..!';
      }
    }
    return response;
  }

  setUserAgent = (agent) => {
    this.agent = agent;
  };

  setIPAddres = (ip) => {
    this.ip = ip;
  };

  async validateWSToken(wsToken: string) {
    const response = {
      success: 1,
      message: '',
    };
    // TODO: ws_token validation
    // try {
    //   if (_.isEmpty(wsToken)) {
    //     const err = { code: -200, message: 'Token not found.' };
    //     throw err;
    //   }

    //   const where:any = {};
    //   where.vWSToken = wsToken;
    //   where.eStatus = ['Active', 'Inactive'];
    //   const result = await restService.getToken(where, '', { limit: 1 });
    //   if (!result.success) {
    //     const err = { code: -201, message: 'Token not found.' };
    //     throw err;
    //   }

    //   const { data } = result;
    //   if (data[0].eStatus === 'Inactive') {
    //     const err = { code: -400, message: 'Token inactivated externally.' };
    //     throw err;
    //   }

    //   const updateWhere:any = {};
    //   updateWhere.vWSToken = wsToken;
    //   updateWhere.eStatus = 'Active';

    //   const updateData: any = {};
    //   if (!data[0].dLastAccess) {
    //     updateData.eStatus = 'Expired';
    //     await restService.updateToken(updateData, updateWhere);
    //     const err = { code: -300, message: 'Token time limit expired.' };
    //     throw err;
    //   }
    //   const activeStatus = this.checkTimeLimit(data[0].dLastAccess);
    //   if (!activeStatus) {
    //     updateData.eStatus = 'Expired';
    //     await restService.updateToken(updateData, updateWhere);
    //     const err = { code: -301, message: 'Token time limit expired.' };
    //     throw err;
    //   } else {
    //     const remoteAddr = this.ip.toString();
    //     const userAgent = this.agent.toString();
    //     if (custom.isEmpty(data[0].vIPAddress)) {
    //       const err = { code: -500, message: 'Invalid token.' };
    //       throw err;
    //     }
    //     if (data[0].vIPAddress !== remoteAddr) {
    //       const err = { code: -501, message: 'Invalid token.' };
    //       throw err;
    //     }
    //     if (custom.isEmpty(data[0].vUserAgent)) {
    //       const err = { code: -502, message: 'Invalid token.' };
    //       throw err;
    //     }
    //     if (data[0].vUserAgent !== userAgent) {
    //       const err = { code: -503, message: 'Invalid token.' };
    //       throw err;
    //     }
    //     updateData.dLastAccess = dateService.getCurrentDateTime();
    //     await restService.updateToken(updateData, updateWhere);
    //   }
    // } catch (err) {
    //   if (typeof err === 'object') {
    //     response.success = -2;
    //     // switch (err.code) {
    //     //   case -200:
    //     //   case -201:
    //     //     response.success = -200;
    //     //     break;
    //     //   case -300:
    //     //   case -301:
    //     //     response.success = -300;
    //     //     break;
    //     //   case -400:
    //     //     response.success = -400;
    //     //     break;
    //     //   case -500:
    //     //   case -501:
    //     //   case -502:
    //     //   case -503:
    //     //     response.success = -500;
    //     //     break;
    //     //   default:
    //     //     break;
    //     // }
    //     response.message = err.message;
    //   } else if (typeof err === 'string') {
    //     response.message = err;
    //   }
    // }
    return response;
  }

  async checkTimeLimit(tokenTime: string) {
    const timeLimit = await this.cacheService.get('WS_TIME_LIMIT');
    if (!timeLimit) {
      return false;
    }
    if (!tokenTime) {
      return false;
    }

    let prevTime = new Date(tokenTime).getTime();
    let currTime = new Date().getTime();
    prevTime /= 1000;
    currTime /= 1000;

    const avaiLimit = Math.round(Math.abs(currTime - prevTime) / 60);
    if (avaiLimit > Number(timeLimit)) {
      return true;
    }
    return false;
  }
}
