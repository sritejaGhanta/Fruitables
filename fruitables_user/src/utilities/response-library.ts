import { Injectable } from '@nestjs/common';
import * as _ from 'lodash';

import {
  processRequestPregMatch,
  processSystemPregMatch,
  replaceHashedParameters,
} from './custom-helper';

import { LoggerHandler } from './logger-handler';
import apiConfig from '../config/cit-api-config';

@Injectable()
export class ResponseLibrary {
  protected readonly log = new LoggerHandler(
    ResponseLibrary.name,
  ).getInstance();

  outputResponse(outputParams: any, funcParams: any) {
    let { ...returnData } = outputParams;
    let { ...outputData } = outputParams.data;
    let [...outputFields] = outputParams.settings.fields;
    let [...outputKeys] =
      'output_keys' in funcParams ? funcParams.output_keys : [];
    let { ...outputAlias } =
      'output_alias' in funcParams ? funcParams.output_alias : {};
    let [...outputObjects] =
      'output_objects' in funcParams ? funcParams.output_objects : [];
    let [...innerKeys] =
      'inner_keys' in funcParams ? funcParams.inner_keys : [];
    let [...singleKeys] =
      'single_keys' in funcParams ? funcParams.single_keys : [];
    let [...multipleKeys] =
      'multiple_keys' in funcParams ? funcParams.multiple_keys : [];
    let [...customKeys] =
      'custom_keys' in funcParams ? funcParams.custom_keys : [];

    returnData = _.isObject(returnData) ? returnData : {};
    outputData = _.isObject(outputData) ? outputData : {};
    outputFields = this.makeUniqueParams(outputFields);
    outputKeys = this.makeUniqueParams(outputKeys);
    singleKeys = this.makeUniqueParams(singleKeys);
    multipleKeys = this.makeUniqueParams(multipleKeys);
    customKeys = this.makeUniqueParams(customKeys);

    innerKeys = _.isArray(innerKeys) ? innerKeys : [];
    outputKeys = _.isArray(outputKeys) ? outputKeys : [];
    outputAlias = _.isObject(outputAlias) ? outputAlias : {};
    outputObjects = _.isArray(outputObjects) ? outputObjects : [];

    const processKeys = {
      output_data: outputData,
      ouput_fields: outputFields,
      output_keys: outputKeys,
      output_alias: outputAlias,
      output_objects: outputObjects,
      inner_keys: innerKeys,
      single_keys: singleKeys,
      multiple_keys: multipleKeys,
      custom_keys: customKeys,
    };

    const apiName = funcParams.name;
    const filterData = this.getFilteredData(processKeys);
    const aliasData = this.prepareAliasData(filterData, processKeys);
    const finalData = this.finalResponseData(aliasData, processKeys);
    const settingsFields = this.prepareAliasFields(outputFields, outputAlias);
    const settingFields = this.makeUniqueParams(settingsFields);
    const finishMessage = outputParams.settings.message;

    returnData.data = finalData;
    returnData.settings.fields = settingFields;
    delete returnData.settings.fields;
    returnData.settings.message = this.getFinishMessage(
      apiName,
      finishMessage,
      outputData,
    );

    if (
      _.isObject(apiConfig[apiName]) &&
      'format' in apiConfig[apiName] &&
      apiConfig[apiName].format == 'array'
    ) {
      if (
        typeof returnData.data === 'object' &&
        Object.keys(returnData.data).length == 0
      ) {
        returnData.data = [];
      }
    }
    return returnData;
  }

  makeUniqueParams(params: any) {
    let result = [];
    if (_.isArray(params)) {
      result = [...new Set(params)];
    }
    return result;
  }

  getFilteredData(params: any) {
    const { ...outputData } = params.output_data;
    const [...outputKeys] = params.output_keys;
    const [...customKeys] = params.custom_keys;
    const returnData = {};

    if (!_.isArray(outputKeys) || _.isEmpty(outputKeys)) {
      return returnData;
    }

    let loopKey;
    let loopData;
    let deepFilter;
    for (let i = 0; i < outputKeys.length; i += 1) {
      loopKey = outputKeys[i];
      if (_.isObject(outputData) && loopKey in outputData) {
        loopData = outputData[loopKey];
        if (_.isArray(customKeys) && customKeys.includes(loopKey)) {
          returnData[loopKey] = loopData;
        } else if (_.isArray(loopData) && loopData.length > 0) {
          deepFilter = this.getSpecificFields(loopData, params);
          returnData[loopKey] =
            _.isArray(deepFilter) || _.isObject(deepFilter) ? deepFilter : {};
        } else if (_.isObject(loopData) && !_.isEmpty(loopData)) {
          deepFilter = this.getSpecificFields(loopData, params);
          returnData[loopKey] =
            _.isArray(deepFilter) || _.isObject(deepFilter) ? deepFilter : {};
        } else {
          returnData[loopKey] = loopData;
        }
      }
    }
    return returnData;
  }

  getSpecificFields(innerData: any, params: any) {
    const [...outputFields] = params.ouput_fields;
    const [...innerKeys] = params.inner_keys;

    let returnData;
    if (_.isArray(innerData)) {
      returnData = [];
    } else {
      returnData = {};
    }

    if (!_.isObject(innerData) || _.isEmpty(innerData)) {
      return returnData;
    }

    let tempData;
    Object.keys(innerData).forEach((dKey) => {
      if (_.isArray(innerData[dKey]) || _.isObject(innerData[dKey])) {
        if (_.isArray(innerKeys) && innerKeys.includes(dKey)) {
          tempData = this.getSpecificFields(innerData[dKey], params);
          if (_.isArray(tempData) || _.isObject(tempData)) {
            returnData[dKey] = tempData;
          }
        } else if (_.isArray(outputFields) && outputFields.includes(dKey)) {
          returnData[dKey] = innerData[dKey];
        } else {
          returnData[dKey] = this.getSpecificFields(innerData[dKey], params);
        }
      } else if (_.isArray(outputFields) && outputFields.includes(dKey)) {
        returnData[dKey] = innerData[dKey];
      }
    });
    return returnData;
  }

  prepareAliasData(filterData: any, params: any) {
    const { ...outputAlias } =
      'output_alias' in params ? params.output_alias : {};
    const [...customKeys] = 'custom_keys' in params ? params.custom_keys : [];
    const [...outputObjects] =
      'output_objects' in params ? params.output_objects : [];

    if (!_.isArray(filterData) && !_.isObject(filterData)) {
      return filterData;
    }

    let processData;
    if (_.isArray(filterData)) {
      processData = [...filterData];
    } else {
      processData = { ...filterData };
    }

    let tmpData;
    let idxData;
    if (_.isArray(outputObjects) && outputObjects.length > 0) {
      if (_.isArray(filterData)) {
        tmpData = [...filterData];
      } else {
        tmpData = { ...filterData };
      }
      Object.keys(filterData).forEach((dKey) => {
        if (outputObjects.includes(dKey) && !_.isEmpty(filterData[dKey])) {
          if (_.isArray(filterData[dKey]) && filterData[dKey].length > 0) {
            idxData = { ...filterData[dKey][0] };
            tmpData[dKey] = idxData;
          } else if (
            outputObjects.includes(dKey) &&
            _.isEmpty(filterData[dKey])
          ) {
            tmpData[dKey] = {};
          }
        }
      });
      processData = tmpData;
    }

    if (!_.isObject(outputAlias) || _.isEmpty(outputAlias)) {
      return processData;
    }

    let processFlag;
    let returnData;
    let tempData;
    if (_.isArray(processData)) {
      returnData = [...processData];
    } else {
      returnData = { ...processData };
    }

    Object.keys(processData).forEach((dKey) => {
      processFlag = 1;
      if (_.isArray(processData[dKey]) || _.isObject(processData[dKey])) {
        if (_.isArray(customKeys) && customKeys.includes(dKey)) {
          processFlag = 0;
        } else {
          tempData = this.prepareAliasData(processData[dKey], params);
        }
      } else {
        tempData = processData[dKey];
      }

      if (processFlag) {
        if (dKey in outputAlias) {
          delete returnData[dKey];
          returnData[outputAlias[dKey]] = tempData;
        } else {
          returnData[dKey] = tempData;
        }
      }
    });

    return returnData;
  }

  finalResponseData(aliasData: any, params: any) {
    const [...outputObjects] = params.output_objects;
    const { ...outputAlias } = params.output_alias;
    const [...singleKeys] = params.single_keys;
    const [...multipleKeys] = params.multiple_keys;
    const [...customKeys] = params.custom_keys;

    let returnData;
    if (!_.isArray(aliasData) && !_.isObject(aliasData)) {
      return returnData;
    }

    let processData = {};
    let processFlag = 1;
    let taKeys;
    let tbKeys;
    let objKey;
    Object.keys(aliasData).forEach((dKey) => {
      if (processFlag === 0) {
        return;
      }
      if (_.isArray(aliasData[dKey]) && aliasData[dKey].length > 1) {
        if (_.isObject(aliasData[dKey][1])) {
          processFlag = 0;
          return;
        }
      } else if (
        _.isObject(aliasData[dKey]) &&
        Object.keys(aliasData[dKey]).length > 1
      ) {
        taKeys = Object.keys(aliasData[dKey]);
        if (
          _.isArray(aliasData[dKey][taKeys[1]]) ||
          _.isObject(aliasData[dKey][taKeys[1]])
        ) {
          processFlag = 0;
          return;
        }
      }

      if (
        multipleKeys.length > 1 &&
        (multipleKeys.includes(dKey) ||
          Object.values(outputAlias).indexOf(dKey) >= 0)
      ) {
        processFlag = 0;
        return;
      }
      if (
        multipleKeys.length > 0 &&
        singleKeys.length > 0 &&
        (multipleKeys.includes(dKey) || dKey in outputAlias)
      ) {
        processFlag = 0;
        return;
      }
      if (customKeys.length > 0 && customKeys.includes(dKey)) {
        processFlag = 0;
        return;
      }
      if (_.isArray(aliasData[dKey]) && !_.isEmpty(aliasData[dKey])) {
        if (_.isObject(aliasData[dKey][0]) && !_.isEmpty(aliasData[dKey][0])) {
          processData = { ...processData, ...aliasData[dKey][0] };
        }
      } else if (_.isObject(aliasData[dKey]) && !_.isEmpty(aliasData[dKey])) {
        tbKeys = Object.keys(aliasData[dKey]);
        if (
          _.isObject(aliasData[dKey][tbKeys[0]]) &&
          !_.isEmpty(aliasData[dKey][tbKeys[0]])
        ) {
          processData = { ...processData, ...aliasData[dKey][tbKeys[0]] };
        } else {
          processData = { ...processData, ...aliasData[dKey] };
        }
      }

      objKey = dKey;
      if (dKey in outputAlias) {
        objKey = _.invert(outputAlias)[dKey] || dKey;
      }
      if (!_.isArray(outputObjects) || !outputObjects.includes(objKey)) {
        processFlag = 2;
      }
    });

    if (processFlag > 0) {
      if (processFlag === 1) {
        returnData = processData;
      } else if (_.isObject(processData) && !_.isEmpty(processData)) {
        returnData = [processData];
      } else {
        returnData = processData;
      }
    } else if (_.isObject(aliasData) && Object.keys(aliasData).length === 1) {
      const idxKeys = Object.keys(aliasData);
      returnData = aliasData[idxKeys[0]];
    } else {
      returnData = aliasData;
    }

    return returnData;
  }

  prepareAliasFields(fields: any, alias: any) {
    if (!_.isArray(fields) || _.isEmpty(fields)) {
      return fields;
    }
    if (!_.isObject(alias) || _.isEmpty(alias)) {
      return fields;
    }
    let idx;
    Object.keys(alias).forEach((key) => {
      if (_.isArray(fields) && fields.includes(key)) {
        idx = fields.indexOf(key);
        fields[idx] = alias[key];
      }
    });
    return fields;
  }

  getFinishMessage(wsFunc: string, msgCode: string, params: any) {
    // let message = WSLang.getFinishMessage(wsFunc, msgCode);
    let message = msgCode;
    if (message) {
      if (message.indexOf('#') >= 0) {
        message = replaceHashedParameters(message, params);
      }
      if (message.indexOf('{%REQUEST') >= 0) {
        message = processRequestPregMatch(message, params);
      }
      if (message.indexOf('{%SYSTEM') >= 0) {
        message = processSystemPregMatch(message, params);
      }
      message = message.replace(/\\(.)/gm, '$1').trim();
    } else {
      message = msgCode;
    }
    return message;
  }

  assignSingleRecord(inputParams: any, outputData: any) {
    if (_.isArray(outputData) && !_.isEmpty(outputData)) {
      if (_.isObject(outputData[0]) && !_.isEmpty(outputData[0])) {
        inputParams = { ...inputParams, ...outputData[0] };
      }
    } else if (_.isObject(outputData) && !_.isEmpty(outputData)) {
      inputParams = { ...inputParams, ...outputData };
    }
    return inputParams;
  }

  assignFunctionResponse(outputData: any, mappingKeys?: any) {
    let returnData: any;
    if (_.isArray(outputData) || _.isObject(outputData)) {
      returnData = outputData;
      if (_.isObject(mappingKeys) && !_.isEmpty(mappingKeys)) {
        returnData = this.prepareAliasData(returnData, {
          output_alias: mappingKeys,
        });
      }
    }
    return returnData;
  }

  appendFunctionResponse(inputParams: any, outputData: any, mappingKeys: any) {
    // TODO: Testing Pending
    let returnData = [];
    if (_.isArray(outputData.data) || _.isObject(outputData.data)) {
      returnData = outputData.data;
      if (_.isObject(mappingKeys) && !_.isEmpty(mappingKeys)) {
        returnData = this.prepareAliasData(returnData, {
          output_alias: mappingKeys,
        });
      }
    }
    return returnData;
  }

  unsetFunctionResponse(inputParams: any, outputData: any, mappingKeys: any) {
    // TODO: Testing Pending
    let returnData = [];
    if (_.isArray(outputData.data) || _.isObject(outputData.data)) {
      returnData = outputData.data;
      if (_.isObject(mappingKeys) && !_.isEmpty(mappingKeys)) {
        returnData = this.prepareAliasData(returnData, mappingKeys);
      }
    }
    return returnData;
  }

  filterLoopParams(outputData: any, loopData: any, inputParams: any) {
    const tempData = { ...outputData };
    const sendData = {};
    const extraKeys = {};

    Object.keys(outputData).forEach((key) => {
      if (!(key in inputParams)) {
        extraKeys[key] = outputData[key];
      }
    });

    let unsetData = [];
    Object.keys(extraKeys).forEach((key) => {
      sendData[key] = extraKeys[key];
      if (_.isObject(extraKeys[key])) {
        unsetData = unsetData.concat(Object.keys(extraKeys[key]));
      }
    });

    let unsetKey;
    Object.keys(unsetData).forEach((key) => {
      unsetKey = unsetData[key];
      if (unsetKey in sendData) {
        delete sendData[unsetKey];
      }
    });

    const prevData = {};
    if (_.isObject(loopData)) {
      Object.keys(loopData).forEach((key) => {
        if (key in tempData) {
          prevData[key] = tempData[key];
        }
      });
    }

    const resData = { ...prevData, ...sendData };
    return resData;
  }

  grabLoopVariables(loopVars: any, inputParams: any) {
    if (!_.isArray(loopVars) || loopVars.length === 0) {
      return inputParams;
    }

    Object.keys(loopVars).forEach((key) => {
      if (_.isObject(loopVars[key]) && !_.isEmpty(loopVars[key])) {
        inputParams = { ...inputParams, ...loopVars[key] };
      }
    });

    return inputParams;
  }
}
