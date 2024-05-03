import { HttpStatus, Injectable } from '@nestjs/common';

import axios from 'axios';
import * as _ from 'lodash';
import * as sharp from 'sharp';
import * as fse from 'fs-extra';
import * as FormData from 'form-data';

import { isEmpty } from '../utilities/custom-helper';
import { LoggerHandler } from 'src/utilities/logger-handler';
import {
  FailureCaseDto,
  SuccessCaseDto,
} from 'src/common/dto/external-api.dto';
import {
  DynamicKeyStrDto,
  StandardCallbackDto,
  StandardResultDto,
} from 'src/common/dto/common.dto';
import { ImageResizeDto } from 'src/common/dto/amazon.dto';

import * as stream from 'stream';
import { promisify } from 'util';

@Injectable()
export class HttpService {
  private readonly log = new LoggerHandler(HttpService.name).getInstance();

  async get(url: string, data?: any, headers?: any, options?: any) {
    let result;
    try {
      const config = {
        headers,
        params: data,
      };
      if ('async' in options && options.async === true) {
        axios
          .get(url, config)
          .then(function (response) {
            this.log.info(response);
          })
          .catch(function (error) {
            this.log.error(error);
          });
        result = {
          success: 1,
        };
      } else {
        const response = await axios.get(url, config);
        result = {
          success: 1,
          message: response.statusText,
          status: response.status,
          code: 'OK',
          body: response.data,
        };
      }
    } catch (error) {
      result = {
        success: 0,
        message: error.response.statusMessage,
        status: error.response.statusCode,
        code: error.name,
        body: error.response.body,
      };
    }
    return result;
  }

  async post(url: string, data?: any, headers?: any, options?: any) {
    let result;
    try {
      const config = {
        headers,
        params: {},
        data: {},
      };
      if (options.input_type === 'raw') {
        if (typeof data === 'string') {
          data = JSON.parse(data.trim());
        }
        config.data = data;
      } else if (options.input_type === 'x-www-form-urlencoded') {
        config.data = data;
      } else {
        const fileKeys = options.file_keys;
        const formBody = new FormData();
        Object.keys(data).forEach((key) => {
          if (_.isArray(fileKeys) && fileKeys.includes(key)) {
            formBody.append(key, fse.createReadStream(data[key].path));
          } else {
            formBody.append(key, data[key]);
          }
        });
        config.data = formBody;
      }
      if ('async' in options && options.async === true) {
        axios
          .post(url, config)
          .then(function (response) {
            this.log.info(response);
          })
          .catch(function (error) {
            this.log.error(error);
          });
        result = {
          success: 1,
        };
      } else {
        const response = await axios.post(url, config);
        result = {
          success: 1,
          message: response.statusText,
          status: response.status,
          code: 'OK',
          body: response.data,
        };
      }
    } catch (error) {
      result = {
        success: 0,
        message: error.response.statusMessage,
        status: error.response.statusCode,
        code: error.name,
        body: error.response.body,
      };
    }
    return result;
  }

  async put(url: string, data?: any, headers?: any, options?: any) {
    let result;
    try {
      const config = {
        headers,
        params: {},
        data: {},
      };
      if (options.input_type === 'raw') {
        if (typeof data === 'string') {
          data = JSON.parse(data.trim());
        }
        config.data = data;
      } else if (options.input_type === 'x-www-form-urlencoded') {
        config.data = data;
      }
      if ('async' in options && options.async === true) {
        axios
          .put(url, config)
          .then(function (response) {
            this.log.info(response);
          })
          .catch(function (error) {
            this.log.error(error);
          });
        result = {
          success: 1,
        };
      } else {
        const response = await axios.put(url, config);
        result = {
          success: 1,
          message: response.statusText,
          status: response.status,
          code: 'OK',
          body: response.data,
        };
      }
    } catch (error) {
      result = {
        success: 0,
        message: error.response.statusMessage,
        status: error.response.statusCode,
        code: error.name,
        body: error.response.body,
      };
    }
    return result;
  }

  async delete(url: string, data?: any, headers?: any, options?: any) {
    let result;
    try {
      const config = {
        headers,
        params: {},
        data: {},
      };
      if (options.input_type === 'raw') {
        if (typeof data === 'string') {
          data = JSON.parse(data.trim());
        }
        config.data = data;
      } else if (options.input_type === 'x-www-form-urlencoded') {
        config.data = data;
      }
      if ('async' in options && options.async === true) {
        axios
          .delete(url, config)
          .then(function (response) {
            this.log.info(response);
          })
          .catch(function (error) {
            this.log.error(error);
          });
        result = {
          success: 1,
        };
      } else {
        const response = await axios.delete(url, config);
        result = {
          success: 1,
          message: response.statusText,
          status: response.status,
          code: 'OK',
          body: response.data,
        };
      }
    } catch (error) {
      result = {
        success: 0,
        message: error.response.statusMessage,
        status: error.response.statusCode,
        code: error.name,
        body: error.response.body,
      };
    }
    return result;
  }

  async stream(
    url: string,
    loc?: string,
    headers?: DynamicKeyStrDto,
    options?: StandardCallbackDto & ImageResizeDto,
  ): Promise<StandardResultDto> {
    let result: StandardResultDto;
    try {
      if ('async' in options && options.async === true) {
        axios
          .get(url, {
            responseType: 'stream',
            headers,
          })
          .then((response) => {
            response.data.pipe(fse.createWriteStream(loc));
            if (options?.callback) {
              options.callback(null, response);
            }
          })
          .catch((error) => {
            this.log.error(error);
            if (options?.callback) {
              options.callback(error, null);
            }
          });
        result = {
          success: 1,
          message: 'OK',
          status: HttpStatus.OK,
        };
      } else {
        const finished = promisify(stream.finished);
        await new Promise((resolve, reject) => {
          axios
            .get(url, {
              responseType: loc ? 'stream' : 'arraybuffer',
              headers,
            })
            .then((response) => {
              this.log.debug('File download started');
              if (loc) {
                const b = fse.createWriteStream(loc);
                response.data.pipe(b);
                return finished(b);
                // b.on("finish", resolve);
              } else if (options?.edits) {
                sharp(response.data)
                  .resize(
                    options.edits.resize.width,
                    options.edits.resize.height,
                    {
                      fit: options.edits.resize.fit,
                      background: options.edits.resize.background,
                    },
                  )
                  // .flatten(flatten)
                  .toFile(options.dst_path)
                  .then((data) => {
                    this.log.debug('[getResizedImage] >> Resize Completed');
                  })
                  .catch((error) => {
                    this.log.error('[getResizedImage] >> Error ', error);
                  });
              }
              this.log.debug('File download completed');
            })
            .catch((error) => {
              this.log.error(error);
              reject({ error });
            })
            .finally(() => {
              this.log.debug('File process finished');
              resolve({ data: {} });
            });
        });
        result = {
          success: 1,
          message: 'OK',
          status: HttpStatus.OK,
        };
      }
    } catch (error) {
      this.log.error(error);
      result = {
        success: 0,
        message: error?.response?.statusText,
        status: error?.response?.status,
      };
    }
    return result;
  }

  process(result?: any, options?: any, params?: any) {
    const response = {
      success: result.success,
      message: result.message,
      data: result.body,
      info: {
        status_code: result.status,
        error_code: null,
        error_message: null,
      },
    };
    if (!result.success) {
      response.info.error_code = result.code;
      response.info.error_message = result.message;
    }

    const outputData = result?.body;
    const statusCode = result?.status;
    const successCase: SuccessCaseDto = options?.success_case;
    const failureCase: FailureCaseDto = options?.failure_case;

    let isTrue = null;
    let isFail = null;
    let prepareData;
    let processData;

    // success case
    if (_.isObject(successCase) && _.isObject(successCase?.condition)) {
      const successCond = successCase?.condition;
      const { separator } = successCase;
      const condType = successCond?.type;
      const condOper = successCond?.oper;
      const condVal = successCond?.val;

      if (condType === 'response') {
        const condKey = successCond.key;
        const match = this.fetchResponse(outputData, condKey, separator);
        isTrue = this.checkCondition(condOper, match, condVal);
      } else if (condType === 'status') {
        isTrue = this.checkCondition(condOper, statusCode, Number(condVal));
      }

      if (isTrue === true) {
        let rmIdx;
        if (successCase.target) {
          prepareData = this.fetchResponse(
            outputData,
            successCase.target,
            separator,
          );
          rmIdx = successCase.target;
        } else {
          prepareData = outputData;
          rmIdx = '';
        }
        if (!successCase.output || !_.isObject(successCase.output)) {
          processData = prepareData;
        } else {
          processData = this.fetchReturnData(
            prepareData,
            successCase.output,
            separator,
            rmIdx,
          );
        }
      }
    }

    if (isTrue !== true) {
      if (_.isObject(failureCase) && _.isObject(failureCase.condition)) {
        const failureCond = failureCase.condition;
        const { separator } = failureCase;
        const condType = failureCond.type;
        const condOper = failureCond.oper;
        const condVal = failureCond.val;

        if (condType === 'response') {
          const condKey = failureCond.key;
          const match = this.fetchResponse(outputData, condKey, separator);
          isFail = this.checkCondition(condOper, match, condVal);
        } else if (condType === 'status') {
          isFail = this.checkCondition(condOper, statusCode, Number(condVal));
        }

        if (isFail === true) {
          let rmIdx;
          if (failureCase.target) {
            prepareData = this.fetchResponse(
              outputData,
              failureCase.target,
              separator,
            );
            rmIdx = failureCase.target;
          } else {
            prepareData = outputData;
            rmIdx = '';
          }
          if (!failureCase.output || !_.isObject(failureCase.output)) {
            processData = prepareData;
          } else {
            processData = this.fetchReturnData(
              prepareData,
              failureCase.output,
              separator,
              rmIdx,
            );
          }
        }
      }
    }

    if (isTrue !== true && isFail !== true) {
      processData = outputData;
    }
    response.data = processData;

    return response;
  }

  fetchResponse(data?: any, key?: string, separator?: string) {
    if (!_.isArray(data) && !_.isObject(data)) {
      return false;
    }
    if (isEmpty(key)) {
      return false;
    }
    let match = data;
    separator = separator || '.';
    const keysList = key.split(separator);
    keysList.forEach((val) => {
      match = match[val];
    });
    return match;
  }

  checkCondition(oper: string, value1?: any, value2?: any) {
    let flag: boolean;
    switch (oper) {
      case 'ne':
        flag = value1 !== value2;
        break;
      case 'lt':
        flag = value1 < value2;
        break;
      case 'le':
        flag = value1 <= value2;
        break;
      case 'gt':
        flag = value1 > value2;
        break;
      case 'ge':
        flag = value1 >= value2;
        break;
      case 'in':
        value2 = _.isArray(value2) ? value2 : value2.split(',');
        flag = !!value1.includes(value2);
        break;
      case 'ni':
        value2 = _.isArray(value2) ? value2 : value2.split(',');
        flag = !value1.includes(value2);
        break;
      case 'nu':
        flag = !!isEmpty(value1);
        break;
      case 'nn':
        flag = !isEmpty(value1);
        break;
      default:
        flag = value1 === value2;
        break;
    }
    return flag;
  }

  fetchReturnData(data?: any, output?: any, separator?: string, rmIdx?: any) {
    if (!_.isArray(data) && !_.isObject(data)) {
      return [];
    }

    let result: any;
    try {
      separator = separator || '.';
      if (_.isArray(data)) {
        result = [];
        data.forEach((dVal, dKey) => {
          Object.keys(output).forEach((oKey) => {
            const oVal = output[oKey];
            const { value, found } = this.checkReturnData(
              oKey,
              dVal,
              separator,
              rmIdx,
            );
            if (found) {
              if (!_.isObject(result[dKey])) {
                result[dKey] = {};
              }
              if ('children' in oVal && _.isObject(oVal.children)) {
                result[dKey][oVal.key_name] = this.fetchReturnData(
                  value,
                  oVal.children,
                  separator,
                  rmIdx,
                );
              } else {
                result[dKey][oVal.key_name] = value;
              }
            }
          });
        });
      } else {
        result = {};
        Object.keys(output).forEach((oKey) => {
          const oVal = output[oKey];
          const { value, found } = this.checkReturnData(
            oKey,
            data,
            separator,
            rmIdx,
          );
          if (found) {
            if ('children' in oVal && _.isObject(oVal.children)) {
              result[oVal.key_name] = this.fetchReturnData(
                value,
                oVal.children,
                separator,
                rmIdx,
              );
            } else {
              result[oVal.key_name] = value;
            }
          }
        });
      }
    } catch (err) {
      this.log.error('Fetch Return Data Error:', err);
    }
    return result;
  }

  checkReturnData(
    key?: string,
    data?: any,
    separator?: string,
    rmIdx?: string,
  ) {
    if (_.isString(rmIdx) && rmIdx !== '') {
      const len = `${rmIdx}${separator}`.length;
      key = `${key.substring(0, 0)}${key.substring(0 + len)}`;
    }

    let found = false;
    let value = data;
    const keysList = key.split(separator);

    keysList.forEach((val) => {
      if (_.isArray(value)) {
        if (_.isObject(value[0]) && val in value[0]) {
          value = value[val];
          found = true;
        }
      } else if (_.isObject(value)) {
        if (val in value) {
          value = value[val];
          found = true;
        }
      }
    });
    return {
      value,
      found,
    };
  }
}
