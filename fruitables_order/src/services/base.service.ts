import { Inject, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import * as _ from 'lodash';

import * as custom from 'src/utilities/custom-helper';
import { LoggerHandler } from 'src/utilities/logger-handler';
import { CitGeneralLibrary } from 'src/utilities/cit-general-library';

import { ModuleService } from 'src/services/module.service';

@Injectable()
export class BaseService {
  protected readonly log = new LoggerHandler(BaseService.name).getInstance();

  @Inject()
  protected readonly entityManager: EntityManager;
  @Inject()
  protected readonly moduleService: ModuleService;
  @Inject()
  protected readonly general: CitGeneralLibrary;

  protected moduleName: string;
  protected moduleAPI: string;
  protected serviceConfig: any;
  protected listConfiguration: any;
  protected formConfiguration: any;
  protected optionsConfiguration: any;

  /**
   * setModuleAPI method is used to set module API for calling API identification.
   * @param string moduleAPI array is used to set Module API.
   */
  setModuleAPI(api: string) {
    this.moduleAPI = api;
  }

  /**
   * checkUniqueCondition method is used to check unique condition.
   * @param array inputParams array is used for input params.
   * @return array response returns response for API Custom Block.
   */
  async checkUniqueCondition(inputParams: any) {
    const uniqueFields = this.serviceConfig.unique_fields?.fields;
    const uniqueType = this.serviceConfig.unique_fields?.type;

    let uniqueStatus = 0;
    let uniqueMessage = '';

    if (_.isObject(uniqueFields) && !_.isEmpty(uniqueFields)) {
      const queryConfig: any = {};
      queryConfig.table_name = this.serviceConfig.table_name;
      queryConfig.select_type = 'count';
      queryConfig.where_type = uniqueType;
      queryConfig.where_fields = [];
      if (uniqueType === 'or' && this.moduleAPI === 'update') {
        queryConfig.where_type = 'raw';
        const whereClauses = [];
        const whereBindings = {};
        Object.keys(uniqueFields).forEach((key) => {
          const whereKey = uniqueFields[key];
          const whereVal = inputParams[key];
          whereClauses.push(`${whereKey} = :${whereKey}`);
          whereBindings[whereKey] = whereVal;
        });
        const primaryKey = this.serviceConfig.primary_key;
        const primaryVal = inputParams.id;
        whereBindings[primaryKey] = primaryVal;
        const whereCondition = `(${whereClauses.join(
          ' OR ',
        )}) AND ${primaryKey} <> :${primaryKey}`;
        queryConfig.where_condition = whereCondition;
        queryConfig.where_bindings = whereBindings;
      } else {
        Object.keys(uniqueFields).forEach((key) => {
          queryConfig.where_fields.push({
            field: uniqueFields[key],
            value: inputParams[key],
            oper: 'eq',
          });
        });
        if (this.moduleAPI === 'update') {
          queryConfig.where_fields.push({
            field: this.serviceConfig.primary_key,
            value: inputParams.id,
            oper: 'ne',
          });
        }
      }
      const queryResult = await this.executeSelect(queryConfig);
      if (_.isArray(queryResult.data) && queryResult.data.length > 0) {
        if (queryResult.data[0].numrows > 0) {
          uniqueStatus = 1;
          uniqueMessage = this.serviceConfig.unique_fields?.message;
        }
      }
    }

    return {
      unique_status: uniqueStatus,
      unique_message: uniqueMessage,
    };
  }

  /**
   * listFieldFormatter method is used to list fields processing.
   * @param string val string is having field value
   * @param array row array is having current row data.
   * @param object opts object is used for processing.
   * @return array finalValue returns finalValue for API Field.
   */
  async listFieldFormatter(val: any, row: any, opts: any) {
    let finalValue = val;
    const rowIdx = opts?.index;
    const fieldName = opts?.field;
    const inputParams = opts?.params;

    const recordId = row[this.serviceConfig.primary_alias];
    const fieldConfig = this.listConfiguration[fieldName];
    if (_.isObject(fieldConfig) && !_.isEmpty(fieldConfig)) {
      let sourceConfig: any = {};
      let ddConfig: any = {};
      if (fieldConfig['form_field']) {
        sourceConfig = this.formConfiguration[fieldConfig['form_field']];
        ddConfig = this.optionsConfiguration[fieldConfig['form_field']];
      }
      if (fieldConfig['encryption']) {
        finalValue = await this.general.decryptData(
          finalValue,
          fieldConfig['enc_method'],
        );
      }
      if (!_.isEmpty(ddConfig) && ddConfig.type === 'enum') {
        const enumRecord = _.find(ddConfig.list, { id: finalValue });
        if (_.isObject(enumRecord)) {
          finalValue = enumRecord['val'];
        }
      }
      if (fieldConfig['renderer']) {
        const renderCallback = this.getCallbackObject(fieldConfig['renderer']);
        if (typeof renderCallback === 'function') {
          finalValue = renderCallback({
            id: recordId,
            api: this.moduleAPI,
            index: rowIdx,
            value: finalValue,
            row_data: row,
            field_name: fieldName,
            input_params: inputParams,
            list_config: fieldConfig,
            form_config: sourceConfig,
            service_config: this.serviceConfig,
          });
        }
      } else if (fieldConfig['format']) {
        finalValue = this.moduleService.convertServerData(
          finalValue,
          fieldConfig,
        );
      }
    }
    return finalValue;
  }

  /**
   * detailFieldFormatter method is used to detail fields processing.
   * @param string val string is having field value
   * @param array row array is having current row data.
   * @param object opts object is used for processing.
   * @return array finalValue returns finalValue for API Field.
   */
  async detailFieldFormatter(val: any, row: any, opts: any) {
    let finalValue = val;
    const fieldName = opts?.field;
    const inputParams = opts?.params;

    const recordId = row[this.serviceConfig.primary_alias];
    const fieldConfig = this.formConfiguration[fieldName];
    if (_.isObject(fieldConfig) && !_.isEmpty(fieldConfig)) {
      if (fieldConfig['encryption']) {
        finalValue = await this.general.decryptData(
          finalValue,
          fieldConfig['enc_method'],
        );
      }
      if (fieldConfig['renderer']) {
        const renderCallback = this.getCallbackObject(fieldConfig['renderer']);
        if (typeof renderCallback === 'function') {
          finalValue = renderCallback({
            id: recordId,
            api: this.moduleAPI,
            value: finalValue,
            row_data: row,
            field_name: fieldName,
            input_params: inputParams,
            form_config: fieldConfig,
            service_config: this.serviceConfig,
          });
        }
      } else if (fieldConfig['format']) {
        finalValue = this.moduleService.convertServerData(
          finalValue,
          fieldConfig,
        );
      }
      if (fieldConfig['type'] === 'multi_select_dropdown') {
        if (val) {
          finalValue = val.split(',').map(Number);
        }
      }
    }
    return finalValue;
  }

  /**
   * formFieldFormatter method is used to form fields processing.
   * @param string val string is having field value
   * @param array row array is having current row data.
   * @param object opts object is used for processing.
   * @return array finalValue returns finalValue for API Field.
   */
  async formFieldFormatter(val: any, row: any, opts: any) {
    let finalValue = val;
    const fieldName = opts?.field;
    const inputParams = opts?.params;

    const fieldConfig = this.formConfiguration[fieldName];
    if (_.isObject(fieldConfig) && !_.isEmpty(fieldConfig)) {
      if (fieldConfig['encryption']) {
        if (fieldConfig['type'] == 'password' && val == '******') {
          finalValue = undefined;
        } else {
          finalValue = await this.general.encryptData(
            finalValue,
            fieldConfig['enc_method'],
          );
        }
      }
      if (fieldConfig['callback']) {
        const saveCallback = this.getCallbackObject(fieldConfig['callback']);
        if (typeof saveCallback === 'function') {
          finalValue = saveCallback({
            id: row.id,
            api: this.moduleAPI,
            value: finalValue,
            field_name: fieldName,
            input_params: inputParams,
            form_config: fieldConfig,
            service_config: this.serviceConfig,
          });
        }
      } else if (fieldConfig['format']) {
        finalValue = this.moduleService.convertClientData(
          finalValue,
          fieldConfig,
        );
      }
      if (fieldConfig['type'] === 'multi_select_dropdown') {
        if (Array.isArray(val)) {
          finalValue = val.join(',');
        }
      }
    }
    return finalValue;
  }

  /**
   * getCallbackObject method is used to process custom method calling.
   * @param string callback string is used for method calling .
   * @return object callback returns calling method instance.
   */
  getCallbackObject(callback: string) {
    if (custom.isEmpty(callback)) {
      return callback;
    }
    if (callback.substring(0, 9) === 'service::' && callback.slice(9) !== '') {
      const serviceMethod = callback.slice(9);
      if (typeof this[serviceMethod] === 'function') {
        return this[serviceMethod];
      }
    } else if (
      callback.substring(0, 9) === 'general::' &&
      callback.slice(9) !== ''
    ) {
      const generalMethod = callback.slice(9);
      if (typeof this.general[generalMethod] === 'function') {
        return this.general[generalMethod];
      }
    } else {
      return callback;
    }
  }

  async executeQuery(rawQuery: string, bindings: any[]) {
    let success;
    let message;
    let data;

    try {
      if (_.isArray(bindings) && bindings.length > 0) {
        data = await this.entityManager.query(rawQuery, bindings);
      } else {
        data = await this.entityManager.query(rawQuery);
      }
      success = 1;
      message = 'Record(s) found.';
    } catch (err) {
      success = 0;
      this.log.error(err);
      if (typeof err === 'object') {
        if (err.sqlMessage) {
          message = err.sqlMessage;
        } else if (err.message) {
          message = err.message;
        } else {
          message = 'Unable to show error message.';
        }
      } else if (typeof err === 'string') {
        message = err;
      }
    }
    return {
      success,
      message,
      data,
    };
  }

  async executeSelect(queryConfig: any) {
    /**
     * queryConfig.table_name -> string or object - required
     * queryConfig.select_type -> string :: fields/count/min/max/sum/avg
     * queryConfig.select_fields -> array
     * queryConfig.where_type -> string :: and/or/raw
     * queryConfig.where_fields -> array
     * queryConfig.where_condition -> string
     * queryConfig.where_bindings -> array
     * queryConfig.join_tables -> array
     * queryConfig.group_by -> string/array
     * queryConfig.having_condition - string
     * queryConfig.having_bindings -> array
     * queryConfig.order_by -> string/array
     * queryConfig.offset -> integer
     * queryConfig.limit -> integer
     */
    let success;
    let message;
    let data;
    try {
      const tableName = queryConfig.table_name;
      const joinTables = queryConfig.join_tables;
      const selectType = queryConfig.select_type;
      const selectFields = queryConfig.select_fields;
      const whereFields = queryConfig.where_fields;
      const whereType = queryConfig.where_type;

      if (!tableName) {
        const err = { code: 404, message: 'Table name not found.' };
        throw err;
      }
      if (['min', 'max', 'sum', 'avg'].includes(selectType)) {
        if (!_.isArray(selectFields) || !selectFields.length) {
          const err = { code: 404, message: 'Select columns not found.' };
          throw err;
        }
      }

      const queryObject = this.entityManager.createQueryBuilder();
      queryObject.from(tableName, tableName);
      if (_.isArray(joinTables) && joinTables.length > 0) {
        this.addJoinTables(queryObject, joinTables);
      }

      if (selectType === 'count') {
        queryObject.select('COUNT(*)', 'numrows');
      } else if (selectType === 'min') {
        queryObject.select(
          `MIN(${selectFields[0].field})`,
          selectFields[0].alias,
        );
      } else if (selectType === 'max') {
        queryObject.select(
          `MAX(${selectFields[0].field})`,
          selectFields[0].alias,
        );
      } else if (selectType === 'sum') {
        queryObject.select(
          `SUM(${selectFields[0].field})`,
          selectFields[0].alias,
        );
      } else if (selectType === 'avg') {
        queryObject.select(
          `AVG(${selectFields[0].field})`,
          selectFields[0].alias,
        );
      } else if (_.isArray(selectFields) && selectFields.length > 0) {
        this.addSelectFields(queryObject, selectFields);
      } else {
        queryObject.select('*');
      }

      if (whereType === 'raw') {
        if (queryConfig.where_condition) {
          if (
            _.isObject(queryConfig.where_bindings) &&
            !_.isEmpty(queryConfig.where_bindings)
          ) {
            queryObject.where(
              queryConfig.where_condition,
              queryConfig.where_bindings,
            );
          } else {
            queryObject.where(queryConfig.where_condition);
          }
        }
      } else if (_.isArray(whereFields) && whereFields.length > 0) {
        this.addWhereFields(queryObject, whereFields, whereType);
      }

      if (queryConfig.group_by) {
        if (_.isArray(queryConfig.group_by)) {
          queryObject.groupBy(queryConfig.group_by);
        } else {
          queryObject.groupBy(queryConfig.group_by);
        }
      }

      if (queryConfig.having_condition) {
        if (
          _.isArray(
            queryConfig.having_bindings &&
              queryConfig.having_bindings.length > 0,
          )
        ) {
          queryObject.having(
            queryConfig.having_condition,
            queryConfig.having_bindings,
          );
        } else {
          queryObject.having(queryConfig.having_condition);
        }
      }

      if (queryConfig.order_by) {
        if (_.isArray(queryConfig.order_by)) {
          for (const item in queryConfig.order_by) {
            queryObject.addOrderBy(item['prop'], item['dir']);
          }
        } else if (_.isObject(queryConfig.order_by)) {
          queryObject.addOrderBy(
            queryConfig.order_by['prop'],
            queryConfig.order_by['dir'],
          );
        }
      }

      if ('limit' in queryConfig && queryConfig.limit > 0) {
        queryObject.limit(queryConfig.limit);
      }

      if ('offset' in queryConfig && queryConfig.offset >= 0) {
        queryObject.offset(queryConfig.offset);
      }

      data = await queryObject.getRawMany();
      if (!_.isArray(data) || _.isEmpty(data)) {
        const err = { code: 404, message: 'No records found.' };
        throw err;
      }

      success = 1;
      message = 'Record(s) found.';
    } catch (err) {
      this.log.error(err);
      success = 0;
      if (typeof err === 'object') {
        if (err.sqlMessage) {
          message = err.sqlMessage;
        } else if (err.message) {
          message = err.message;
        } else {
          message = 'Unable to show error message.';
        }
      } else if (typeof err === 'string') {
        message = err;
      }
    }
    return {
      success,
      message,
      data,
    };
  }

  async executeInsert(queryConfig: any) {
    /**
     * queryConfig.table_name -> string
     * queryConfig.insert_fields -> array
     */
    let success;
    let message;
    let data;

    try {
      const tableName = queryConfig.table_name;
      const insertFields = queryConfig.insert_fields;

      if (!tableName) {
        const err = { code: 404, message: 'Table name not found.' };
        throw err;
      }
      if (!_.isObject(insertFields) && !_.isArray(insertFields)) {
        const err = { code: 404, message: 'Insert columns not found.' };
        throw err;
      }

      const queryObject = this.entityManager.createQueryBuilder();
      queryObject.insert().into(tableName).values(insertFields);
      const res = await queryObject.execute();

      if (!_.isArray(res) || _.isEmpty(res)) {
        const err = { code: 404, message: 'Failure in insertion.' };
        throw err;
      }

      if (_.isArray(insertFields)) {
        data = {
          insert_ids: res,
        };
      } else {
        data = {
          insert_id: res,
        };
      }

      success = 1;
      message = 'Record(s) inserted.';
    } catch (err) {
      success = 0;
      if (typeof err === 'object') {
        if (err.sqlMessage) {
          message = err.sqlMessage;
        } else if (err.message) {
          message = err.message;
        } else {
          message = 'Unable to show error message.';
        }
      } else if (typeof err === 'string') {
        message = err;
      }
    }
    return {
      success,
      message,
      data,
    };
  }

  async executeUpdate(queryConfig: any) {
    /**
     * queryConfig.table_name -> string
     * queryConfig.update_fields -> array
     * queryConfig.where_type -> string :: and/or/raw
     * queryConfig.where_fields -> array
     * queryConfig.where_condition -> string
     * queryConfig.where_bindings -> array
     */
    let success;
    let message;
    let data;

    try {
      const tableName = queryConfig.table_name;
      const updateFields = queryConfig.update_fields;
      const whereFields = queryConfig.where_fields;
      const whereType = queryConfig.where_type;

      if (!tableName) {
        const err = { code: 404, message: 'Table name not found.' };
        throw err;
      }
      if (!_.isObject(updateFields)) {
        const err = { code: 404, message: 'Update columns not found.' };
        throw err;
      }

      const queryObject = this.entityManager.createQueryBuilder();

      if (whereType === 'raw') {
        if (queryConfig.where_condition) {
          if (
            _.isArray(queryConfig.where_bindings) &&
            queryConfig.where_bindings.length > 0
          ) {
            queryObject.where(
              queryConfig.where_condition,
              queryConfig.where_bindings,
            );
          } else {
            queryObject.where(queryConfig.where_condition);
          }
        } else {
          const err = { code: 404, message: 'Where condition not found.' };
          throw err;
        }
      } else if (_.isArray(whereFields) && whereFields.length > 0) {
        this.addWhereFields(queryObject, whereFields, whereType);
      } else {
        const err = { code: 404, message: 'Where fields not found.' };
        throw err;
      }

      queryObject.update(tableName).set(updateFields);

      const res = await queryObject.execute();
      if (!res) {
        const err = { code: 404, message: 'Failure in updation.' };
        throw err;
      }

      data = {
        affected_rows: res,
      };
      success = 1;
      message = 'Record(s) updated.';
    } catch (err) {
      success = 0;
      if (typeof err === 'object') {
        if (err.sqlMessage) {
          message = err.sqlMessage;
        } else if (err.message) {
          message = err.message;
        } else {
          message = 'Unable to show error message.';
        }
      } else if (typeof err === 'string') {
        message = err;
      }
    }
    return {
      success,
      message,
      data,
    };
  }

  async executeDelete(queryConfig: any) {
    /**
     * queryConfig.table_name -> string
     * queryConfig.where_type -> string :: and/or/raw
     * queryConfig.where_fields -> array
     * queryConfig.where_condition -> string
     * queryConfig.where_bindings -> array
     */
    let success;
    let message;
    let data;

    try {
      const tableName = queryConfig.table_name;
      const whereFields: { data: any; type: string } = queryConfig.where_fields;
      const whereType = queryConfig.where_type;

      if (!tableName) {
        const err = { code: 404, message: 'Table name not found.' };
        throw err;
      }

      const queryObject = this.entityManager.createQueryBuilder();

      if (whereType === 'raw') {
        if (queryConfig.where_condition) {
          if (
            _.isArray(queryConfig.where_bindings) &&
            queryConfig.where_bindings.length > 0
          ) {
            queryObject.where(
              queryConfig.where_condition,
              queryConfig.where_bindings,
            );
          } else {
            queryObject.where(queryConfig.where_condition);
          }
        } else {
          const err = { code: 404, message: 'Where condition not found.' };
          throw err;
        }
      } else if (_.isArray(whereFields) && whereFields.length > 0) {
        this.addWhereFields(queryObject, whereFields, whereType);
      } else {
        const err = { code: 404, message: 'Where fields not found.' };
        throw err;
      }

      queryObject.delete().from(tableName);
      const res = await queryObject.execute();
      if (!res) {
        const err = { code: 404, message: 'Failure in deletion.' };
        throw err;
      }

      data = {
        affected_rows: res,
      };
      success = 1;
      message = 'Record(s) deleted.';
    } catch (err) {
      success = 0;
      if (typeof err === 'object') {
        if (err.sqlMessage) {
          message = err.sqlMessage;
        } else if (err.message) {
          message = err.message;
        } else {
          message = 'Unable to show error message.';
        }
      } else if (typeof err === 'string') {
        message = err;
      }
    }
    return {
      success,
      message,
      data,
    };
  }

  addJoinTables(queryObject: any, joinDetails: any[]) {
    if (!_.isArray(joinDetails) || !joinDetails.length) {
      return;
    }

    joinDetails.forEach((joinObj) => {
      const joinTable = {
        [joinObj.join_alias]: joinObj.join_table,
      };
      const mainField = `${joinObj.main_alias}.${joinObj.main_field}`;
      const joinField = `${joinObj.join_alias}.${joinObj.join_field}`;
      const joinType = joinObj.join_type.toLowerCase();
      const extraJoin = joinObj.extra_join;

      if (joinType === 'right') {
        if (extraJoin) {
          queryObject
            .rightJoin(joinTable, mainField, joinField)
            .joinRaw(extraJoin);
        } else {
          queryObject.rightJoin(joinTable, mainField, joinField);
        }
      } else if (joinType === 'left') {
        if (extraJoin) {
          queryObject
            .leftJoin(joinTable, mainField, joinField)
            .joinRaw(extraJoin);
        } else {
          queryObject.leftJoin(joinTable, mainField, joinField);
        }
      } else if (extraJoin) {
        queryObject.join(joinTable, mainField, joinField).joinRaw(extraJoin);
      } else {
        queryObject.join(joinTable, mainField, joinField);
      }
    });
  }

  addSelectFields(queryObject: any, fields: any[]) {
    if (!_.isArray(fields) || !fields.length) {
      return;
    }
    for (const item of fields) {
      queryObject.addSelect(item.field, item.alias);
    }
  }

  addWhereFields(queryObject: any, fields: any[], type: string) {
    if (!_.isArray(fields) || !fields.length) {
      return;
    }

    for (const item of fields) {
      type = type ? type.toLowerCase() : 'and';
      if ('field' in item) {
        const { field } = item;
        const data = 'value' in item ? item.value : undefined;
        const oper = 'oper' in item ? item.oper : 'eq';

        if (data === undefined) {
          if (type === 'or') {
            queryObject.orWhere(field);
          } else {
            queryObject.andWhere(field);
          }
        } else {
          switch (oper) {
            case 'eq':
            case 'li':
              if (type === 'or') {
                queryObject.orWhere(`${field} = :${field}`, {
                  [field]: data,
                });
              } else {
                queryObject.andWhere(`${field} = :${field}`, {
                  [field]: data,
                });
              }
              break;
            case 'ne':
              if (type === 'or') {
                queryObject.orWhere(`${field} <> :${field}`, {
                  [field]: data,
                });
              } else {
                queryObject.andWhere(`${field} <> :${field}`, {
                  [field]: data,
                });
              }
              break;
            case 'lt':
              if (type === 'or') {
                queryObject.orWhere(`${field} < :${field}`, {
                  [field]: data,
                });
              } else {
                queryObject.where(`${field} < :${field}`, {
                  [field]: data,
                });
              }
              break;
            case 'le':
              if (type === 'or') {
                queryObject.orWhere(`${field} <= :${field}`, {
                  [field]: data,
                });
              } else {
                queryObject.where(`${field} <= :${field}`, {
                  [field]: data,
                });
              }
              break;
            case 'gt':
              if (type === 'or') {
                queryObject.orWhere(`${field} > :${field}`, {
                  [field]: data,
                });
              } else {
                queryObject.where(`${field} > :${field}`, {
                  [field]: data,
                });
              }
              break;
            case 'ge':
              if (type === 'or') {
                queryObject.orWhere(`${field} >= :${field}`, {
                  [field]: data,
                });
              } else {
                queryObject.where(`${field} >= :${field}`, {
                  [field]: data,
                });
              }
              break;
            case 'bw':
              if (type === 'or') {
                queryObject.orWhere(`${field} like :${field}`, {
                  [field]: `${data}%`,
                });
              } else {
                queryObject.where(`${field} like :${field}`, {
                  [field]: `${data}%`,
                });
              }
              break;
            case 'bn':
              if (type === 'or') {
                queryObject.orWhereNot(`${field} not like :${field}`, {
                  [field]: `${data}%`,
                });
              } else {
                queryObject.whereNot(`${field} not like :${field}`, {
                  [field]: `${data}%`,
                });
              }
              break;
            case 'ew':
              if (type === 'or') {
                queryObject.orWhere(`${field} like :${field}`, {
                  [field]: `%${data}`,
                });
              } else {
                queryObject.where(`${field} like :${field}`, {
                  [field]: `%${data}`,
                });
              }
              break;
            case 'en':
              if (type === 'or') {
                queryObject.orWhereNot(`${field} not like :${field}`, {
                  [field]: `%${data}`,
                });
              } else {
                queryObject.whereNot(`${field} not like :${field}`, {
                  [field]: `%${data}`,
                });
              }
              break;
            case 'cn':
              if (type === 'or') {
                queryObject.orWhere(`${field} like :${field}`, {
                  [field]: `%${data}%`,
                });
              } else {
                queryObject.where(`${field} like :${field}`, {
                  [field]: `%${data}%`,
                });
              }
              break;
            case 'nc':
              if (type === 'or') {
                queryObject.orWhereNot(`${field} not like :${field}`, {
                  [field]: `%${data}%`,
                });
              } else {
                queryObject.whereNot(`${field} not like :${field}`, {
                  [field]: `%${data}%`,
                });
              }
              break;
            case 'in':
              if (type === 'or') {
                queryObject.orWhere(`${field} IN (:...${field})`, {
                  [field]: data,
                });
              } else {
                queryObject.andWhere(`${field} IN (:...${field})`, {
                  [field]: data,
                });
              }
              break;
            case 'ni':
              if (type === 'or') {
                queryObject.orWhere(`${field} NOT IN (:...${field})`, {
                  [field]: data,
                });
              } else {
                queryObject.andWhere(`${field} NOT IN (:...${field})`, {
                  [field]: data,
                });
              }
              break;
            case 'bt':
              if (type === 'or') {
                queryObject.orWhereBetween(field, data);
              } else {
                queryObject.whereBetween(field, data);
              }
              break;
            case 'nb':
              if (type === 'or') {
                queryObject.orWhereNotBetween(field, data);
              } else {
                queryObject.whereNotBetween(field, data);
              }
              break;
          }
        }
      } else if (_.isObject(item)) {
        const whereKey = Object.keys(item)[0];
        const whereVal = Object.values(item)[0];
        if (type === 'or') {
          if (_.isArray(whereVal)) {
            queryObject.orWhere(`${whereKey} IN (:...${whereKey})`, {
              [whereKey]: whereVal,
            });
          } else {
            queryObject.orWhere(`${whereKey} = :${whereKey}`, {
              [whereKey]: whereVal,
            });
          }
        } else if (_.isArray(whereVal)) {
          queryObject.andWhere(`${whereKey} IN (:...${whereKey})`, {
            [whereKey]: whereVal,
          });
        } else {
          queryObject.andWhere(`${whereKey} = :${whereKey}`, {
            [whereKey]: whereVal,
          });
        }
      }
    }
  }

  // raw = (sql, bindings) => this.db.raw(sql, bindings);
}
