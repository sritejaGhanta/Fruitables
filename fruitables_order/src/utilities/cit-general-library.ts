import { Injectable } from '@nestjs/common';
import * as _ from 'lodash';

import { LoggerHandler } from './logger-handler';
import { GeneralLibrary } from './general-library';
import * as custom from './custom-helper';
import appConfig from 'src/config/appConfig';

@Injectable()
export class CitGeneralLibrary extends GeneralLibrary {
  protected readonly log = new LoggerHandler(
    CitGeneralLibrary.name,
  ).getInstance();

  verifyCustomerLoginPassword(inputParams) {
    const curPassword = inputParams.password;
    const oldPassword = inputParams.mc_password;
    const encryptType = 'bcrypt';

    let isMatched = 0;
    const verifyResult = this.verifyEncrypted(
      curPassword,
      oldPassword,
      encryptType,
    );
    if (verifyResult) {
      isMatched = 1;
    }

    return {
      is_matched: isMatched,
    };
  }

  verifyAdminLoginPassword(inputParams) {
    const curPassword = inputParams.password;
    const oldPassword = inputParams.ma_password;
    const encryptType = 'bcrypt';

    let isMatched = 0;
    const verifyResult = this.verifyEncrypted(
      curPassword,
      oldPassword,
      encryptType,
    );
    if (verifyResult) {
      isMatched = 1;
    }

    return {
      is_matched: isMatched,
    };
  }

  verifyAdminResetPassword(inputParams) {
    const oldPassword = inputParams.old_password;
    const curPassword = inputParams.ma_password;
    const encryptType = 'bcrypt';

    let isMatched = 0;
    const verifyResult = this.verifyEncrypted(
      oldPassword,
      curPassword,
      encryptType,
    );
    if (verifyResult) {
      isMatched = 1;
    }

    let oldPasswordsLimit = Number(appConfig().admin_password_history);
    oldPasswordsLimit = oldPasswordsLimit || 5;

    return {
      is_matched: isMatched,
      old_passwords_limit: oldPasswordsLimit,
    };
  }

  verifyAdminOldPasswords(inputParams) {
    const oldPasswords = inputParams.get_old_passwords;
    const oldPassword = inputParams.old_password;
    const newPassword = inputParams.new_password;
    const encryptType = 'bcrypt';

    let verifyResult = false;
    let isOldPassword = 0;

    if (oldPassword === newPassword) {
      isOldPassword = 1;
    } else {
      oldPasswords.forEach((val) => {
        if (!verifyResult) {
          verifyResult = this.verifyEncrypted(
            newPassword,
            val.map_password,
            encryptType,
          );
        }
      });
      if (verifyResult) {
        isOldPassword = 1;
      }
    }

    return {
      is_old_password: isOldPassword,
    };
  }

  generateOTPCode() {
    return custom.getRandomNumber(6);
  }

  encryptVerifyToken(keysObject) {
    let verifyToken;
    try {
      verifyToken = this.encryptService.encryptContent(
        JSON.stringify(keysObject),
      );
    } catch (err) {
      this.log.error('[encryptVerifyToken] >> Error ', err);
    }
    return verifyToken;
  }

  getAutocompleteWhere(queryObject, inputParams, extraConfig) {
    // let whereClause = '';

    if ('type' in inputParams && inputParams.type !== 'all') {
      if (inputParams.type === 'inactive' || inputParams.type === 'Inactive') {
        // whereClause = `${this.settingsService.raw(`${extraConfig.table_alias}.eStatus IN (?)`, 'Inactive')}`;
        queryObject.andWhere(
          `${extraConfig.table_alias}.status IN (:...customStatus)`,
          { customStatus: ['Inactive'] },
        );
      } else {
        // whereClause = `${this.settingsService.raw(`${extraConfig.table_alias}.eStatus IN (?)`, 'Active')}`;
        queryObject.andWhere(
          `${extraConfig.table_alias}.status IN (:...customStatus)`,
          { customStatus: ['Active'] },
        );
      }
    }

    if (extraConfig.table_name === 'mod_group_master') {
      const restrictedGroups = appConfig().restrict_admin_groups;
      if (!restrictedGroups.includes(inputParams.group_code)) {
        // const groupCodeClause = `${this.settingsService.raw(`${extraConfig.table_alias}.vGroupCode NOT IN (?)`, restrictedGroups)}`;
        queryObject.andWhere(
          `${extraConfig.table_alias}.groupCode IN (:...restrictedGroups)`,
          { restrictedGroups: restrictedGroups },
        );
        // if (whereClause) {
        //   whereClause = `${whereClause} AND ${groupCodeClause}`;
        // } else {
        //   whereClause = groupCodeClause;
        // }
      }
    }
  }

  prepareListingCriteria(searchObj, inputParams, aliasList, queryObject) {
    const recLimit = Number(this.getConfigItem('REC_LIMIT'))
      ? Number(this.getConfigItem('REC_LIMIT'))
      : 20;
    searchObj.page_index =
      Number(inputParams.page) || Number(inputParams.page_index) || 1;
    searchObj.limit = Number(inputParams.limit)
      ? Number(inputParams.limit)
      : recLimit;

    let aliasKey;
    let aliasVal;
    let queryStr;
    const whereCond = searchObj.where_cond ? [searchObj.where_cond] : [];

    if ('filters' in inputParams) {
      if (
        _.isString(inputParams.filters) &&
        !custom.isEmpty(inputParams.filters)
      ) {
        inputParams.filters = JSON.parse(inputParams.filters);
      }

      if (_.isArray(inputParams.filters)) {
        const { filters } = inputParams;
        filters.forEach((data) => {
          aliasKey = data.key;
          aliasVal = data.value;
          if (aliasKey && aliasKey in aliasList) {
            let prop_val = `custom_${aliasKey}`;
            queryObject.andWhere(`${aliasList[aliasKey]} = :${prop_val}`, {
              [prop_val]: aliasVal,
            });
          }
        });
      }
    }

    // if (whereCond.length > 0) {
    //   searchObj.where_cond = whereCond.join(' AND ');
    // }

    if ('sort' in inputParams) {
      if (_.isString(inputParams.sort) && !custom.isEmpty(inputParams.sort)) {
        inputParams.sort = JSON.parse(inputParams.sort);
      }

      if (_.isArray(inputParams.sort)) {
        const sortList = inputParams.sort;
        const orderByColumns = sortList.map((sortField) => {
          if (
            sortField.prop &&
            sortField.dir &&
            aliasList[sortField.prop] &&
            ['asc', 'desc'].indexOf(sortField.dir) !== -1
          ) {
            queryObject.addOrderBy(
              `${aliasList[sortField.prop]} ${sortField.dir}`,
            );
            // return `${aliasList[sortField.prop]} ${sortField.dir}`;
          }
          //return false;
        });

        // if (orderByColumns.length) {
        //   searchObj.order_by = orderByColumns.join(', ');
        // }
      }
    }

    return searchObj;
  }

  async decryptVerifyToken(token) {
    let tokenInfo: any;
    try {
      if (token) {
        const decodedStr: any = await this.encryptService.decryptContent(token);
        tokenInfo = JSON.parse(decodedStr);
      }
    } catch (err) {
      this.log.error('[decryptVerifyToken] >> Error ', err);
    }
    return tokenInfo;
  }

  getAdminWhereCriteria(
    actionType = '',
    inputParams: any = {},
    queryObject,
    reqObject,
  ) {
    let whereClause: any = '';
    const defaultAdminUsers = appConfig().default_admin_users;
    const restrictAdminGroups = appConfig().restrict_admin_groups;
    if (actionType) {
      switch (actionType) {
        case 'delete':
          /**
           * Return where condition to restrict all "defaultAdminUsers" if
           * 1. They try to delete
           */
          if (_.isArray(defaultAdminUsers) && defaultAdminUsers.length > 0) {
            queryObject.andWhere(
              'userName NOT IN (:...custom_defaultAdminUsers)',
              { custom_defaultAdminUsers: defaultAdminUsers },
            );
          }

          break;
        case 'update':
          /**
           * Return 1 / 0 to restrict all "defaultAdminUsers" record update if
           * 1. They try to change status to "Inactive"
           * 2. They try to change group_id
           */
          if (
            inputParams.status.toLowerCase() === 'inactive' ||
            inputParams.ma_group_id !== inputParams.group_id
          ) {
            if (_.isArray(defaultAdminUsers) && defaultAdminUsers.length > 0) {
              if (defaultAdminUsers.includes(inputParams.username)) {
                whereClause = 0;
              } else {
                whereClause = 1;
              }
            }
          }
          break;
        case 'change_status':
          /**
           * Return where condition to restrict all "defaultAdminUsers" status update if
           * 1. They try to "Inactive"
           */
          if (inputParams.status.toLowerCase() === 'inactive') {
            if (_.isArray(defaultAdminUsers) && defaultAdminUsers.length > 0) {
              queryObject.andWhere(
                'userName NOT IN (:...custom_defaultAdminUsers)',
                { custom_defaultAdminUsers: defaultAdminUsers },
              );
            }
          }
          break;
        case 'details':
          /**
           * Return where condition to restrict all "restrictAdminGroups" users if
           * 1. Logged-in user "group_code" doesn't matches with "restrictAdminGroups"
           */
          if (
            _.isArray(restrictAdminGroups) &&
            restrictAdminGroups.length > 0
          ) {
            if (!restrictAdminGroups.includes(reqObject.user.group_code)) {
              queryObject.andWhere(
                'groupCode NOT IN (:...custom_restrictAdminGroups)',
                { custom_restrictAdminGroups: restrictAdminGroups },
              );
            }
          }
          break;
        case 'list':
          /**
           * Return where condition to restrict all "restrictAdminGroups" users if
           * 1. Logged-in user "group_code" doesn't matches with "restrictAdminGroups"
           */
          if (
            _.isArray(restrictAdminGroups) &&
            restrictAdminGroups.length > 0
          ) {
            if (!restrictAdminGroups.includes(reqObject.user.group_code)) {
              queryObject.andWhere(
                'groupCode NOT IN (:...custom_restrictAdminGroups)',
                { custom_restrictAdminGroups: restrictAdminGroups },
              );
            }
          }
          break;
        default:
          break;
      }
    }
    return whereClause;
  }

  getGroupWhereCriteria(type = '', inputParams, queryObject, requestObj) {
    let whereCond: any = '';
    const defaultAdminGroups = appConfig().default_admin_groups;
    const restrictAdminGroups = appConfig().restrict_admin_groups;
    if (type) {
      switch (type) {
        case 'delete':
          /**
           * Return where condition to restrict all "defaultAdminUsers" if
           * 1. They try to delete
           */
          if (_.isArray(defaultAdminGroups) && defaultAdminGroups.length > 0) {
            queryObject.andWhere(
              'groupCode NOT IN (:...custom_defaultAdminGroups)',
              { custom_defaultAdminGroups: defaultAdminGroups },
            );
          }

          break;
        case 'update':
          /**
           * Return 1 / 0 to restrict all "defaultAdminUsers" record update if
           * 1. They try to change status to "Inactive"
           * 2. They try to change group_id
           */
          if (inputParams.status.toLowerCase() === 'inactive') {
            if (
              _.isArray(defaultAdminGroups) &&
              defaultAdminGroups.length > 0
            ) {
              if (defaultAdminGroups.includes(inputParams.group_code)) {
                whereCond = 0;
              } else {
                whereCond = 1;
              }
            }
          }
          break;
        case 'change_status':
          /**
           * Return where condition to restrict all "defaultAdminUsers" status update if
           * 1. They try to "Inactive"
           */
          if (inputParams.status.toLowerCase() === 'inactive') {
            if (
              _.isArray(defaultAdminGroups) &&
              defaultAdminGroups.length > 0
            ) {
              queryObject.andWhere(
                'groupCode NOT IN (:...custom_defaultAdminGroups)',
                { custom_defaultAdminGroups: defaultAdminGroups },
              );
            }
          }
          break;
        case 'details':
          /**
           * Return where condition to restrict all "restrictAdminGroups" users if
           * 1. Logged-in user "group_code" doesn't matches with "restrictAdminGroups"
           */
          if (
            _.isArray(restrictAdminGroups) &&
            restrictAdminGroups.length > 0
          ) {
            if (!restrictAdminGroups.includes(requestObj.user.group_code)) {
              queryObject.andWhere(
                'groupCode NOT IN (:...custom_restrictAdminGroups)',
                { custom_restrictAdminGroups: restrictAdminGroups },
              );
            }
          }
          break;
        case 'list':
          /**
           * Return where condition to restrict all "restrictAdminGroups" users if
           * 1. Logged-in user "group_code" doesn't matches with "restrictAdminGroups"
           */
          if (
            _.isArray(restrictAdminGroups) &&
            restrictAdminGroups.length > 0
          ) {
            if (!restrictAdminGroups.includes(requestObj.user.group_code)) {
              queryObject.andWhere(
                'groupCode NOT IN (:...custom_restrictAdminGroups)',
                { custom_restrictAdminGroups: restrictAdminGroups },
              );
            }
          }
          break;
        default:
          break;
      }
    }
    return whereCond;
  }

  encryptPassword(value, inputParams, extraConfig) {
    return this.encryptData(value, 'bcrypt');
  }

  verifyCustomerResetPassword(inputParams) {
    const oldPassword = inputParams.old_password;
    const curPassword = inputParams.mc_password;
    const encryptType = 'bcrypt';

    let isMatched = 0;
    const verifyResult = this.verifyEncrypted(
      oldPassword,
      curPassword,
      encryptType,
    );
    if (verifyResult) {
      isMatched = 1;
    }

    return {
      is_matched: isMatched,
    };
  }

  extractHashVarName(str) {
    if (!str) {
      return '';
    }
    return str.trim().substring(1, str.length - 1);
  }

  extractReplaceConfigVars(inputData) {
    const dataObject = {};
    Object.keys(inputData).forEach((conKey) => {
      const replaceVal = inputData[conKey];
      if (
        replaceVal.substr(0, 8) === '#SYSTEM.' &&
        replaceVal.substr(-1) === '#'
      ) {
        const settingName = replaceVal.substr(8, replaceVal.length - 9);
        dataObject[conKey] = this.getConfigItem(settingName);
      } else {
        dataObject[conKey] = replaceVal;
      }
    });
    return dataObject;
  }

  getSysDateFormat1(sourceName, name) {
    return this.dateService.getSystemFormatLabels(sourceName, name);
  }

  prepareListingCriteriaOrderBy(inputParams, aliasList, queryObject) {
    if ('sort' in inputParams) {
      if (_.isString(inputParams.sort) && !custom.isEmpty(inputParams.sort)) {
        inputParams.sort = JSON.parse(inputParams.sort);
      }

      if (_.isArray(inputParams.sort)) {
        const sortList = inputParams.sort;
        const orderByColumns = sortList.map((sortField) => {
          let upperSortDir = sortField.dir
            ? sortField.dir.toUpperCase()
            : 'ASC';

          if (
            sortField.prop &&
            upperSortDir &&
            aliasList[sortField.prop] &&
            ['ASC', 'DESC'].indexOf(upperSortDir) !== -1
          ) {
            queryObject.addOrderBy(aliasList[sortField.prop], upperSortDir);
          }
        });
      }
    }

    return 1;
  }

  prepareListingCriteriaWhere(inputParams, aliasList, queryObject) {
    let aliasKey;
    let aliasVal;

    if ('filters' in inputParams) {
      if (
        _.isString(inputParams.filters) &&
        !custom.isEmpty(inputParams.filters)
      ) {
        inputParams.filters = JSON.parse(inputParams.filters);
      }

      if (_.isArray(inputParams.filters)) {
        const { filters } = inputParams;
        filters.forEach((data) => {
          aliasKey = data.key;
          aliasVal = data.value;
          if (aliasKey && aliasKey in aliasList) {
            let prop_val = `custom_${aliasKey}`;
            queryObject.andWhere(`${aliasList[aliasKey]} = :${prop_val}`, {
              [prop_val]: aliasVal,
            });
          }
        });
      }
    }
  }

  async getCustomDate(val, row, reqObj: any) {
    return this.getDateTime('sys_datetime', { value: val });
  }
}
