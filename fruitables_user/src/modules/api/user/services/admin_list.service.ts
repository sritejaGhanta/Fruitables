interface AuthObject {
  user: any;
}
import { Inject, Injectable, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import * as _ from 'lodash';
import * as custom from 'src/utilities/custom-helper';
import { LoggerHandler } from 'src/utilities/logger-handler';
import { BlockResultDto, SettingsParamsDto } from 'src/common/dto/common.dto';

import { ResponseLibrary } from 'src/utilities/response-library';
import { CitGeneralLibrary } from 'src/utilities/cit-general-library';


import { AdminEntity } from 'src/entities/admin.entity';
import { GroupMasterEntity } from 'src/entities/group-master.entity';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class AdminListService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    AdminListService.name,
  ).getInstance();
  protected inputParams: object = {};
  protected blockResult: BlockResultDto;
  protected settingsParams: SettingsParamsDto;
  protected multipleKeys: any[] = [];
  protected requestObj: AuthObject = {
    user: {},
  };
  
  @InjectDataSource()
  protected dataSource: DataSource;
  @Inject()
  protected readonly general: CitGeneralLibrary;
  @Inject()
  protected readonly response: ResponseLibrary;
    @InjectRepository(AdminEntity)
  protected adminEntityRepo: Repository<AdminEntity>;
  
  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.multipleKeys = [
      'get_admin_list',
    ];
  }

  /**
   * startAdminList method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startAdminList(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.getAdminList(inputParams);
      if (!_.isEmpty(inputParams.get_admin_list)) {
        outputResponse = this.finishSuccess(inputParams);
      } else {
        outputResponse = this.finishFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> admin_list >>', err);
    }
    return outputResponse;
  }
  

  /**
   * getAdminList method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getAdminList(inputParams: any) {
    this.blockResult = {};
    try {
      const extraConfig = {
        table_name: 'mod_admin',
        table_alias: 'ma',
        primary_key: 'id',
        request_obj: this.requestObj,
      };
      let pageIndex = 1;
      if ('page' in inputParams) {
        pageIndex = Number(inputParams.page);
      } else if ('page_index' in inputParams) {
        pageIndex = Number(inputParams.page_index);
      }
      pageIndex = pageIndex > 0 ? pageIndex : 1;
      const recLimit = Number(inputParams.limit);
      const startIdx = custom.getStartIndex(pageIndex, recLimit);

      let queryObject = this.adminEntityRepo.createQueryBuilder('ma');

      queryObject.leftJoin(GroupMasterEntity, 'mgm', 'ma.groupId = mgm.id');
      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.andWhere('ma.name LIKE :name', { name: `%${inputParams.keyword}%` });
      }
      //@ts-ignore;              
      this.getWhereClause(queryObject, inputParams, extraConfig);

      const totalCount = await queryObject.getCount();
      this.settingsParams = custom.getPagination(totalCount, pageIndex, recLimit);
      if (!totalCount) {
        throw new Error('No records found.');
      }

      queryObject = this.adminEntityRepo.createQueryBuilder('ma');

      queryObject.leftJoin(GroupMasterEntity, 'mgm', 'ma.groupId = mgm.id');
      queryObject.select('ma.id', 'admin_id');
      queryObject.addSelect('ma.name', 'name');
      queryObject.addSelect('ma.email', 'email');
      queryObject.addSelect('ma.username', 'username');
      queryObject.addSelect('ma.phoneNumber', 'phone_number');
      queryObject.addSelect('ma.groupId', 'group_id');
      queryObject.addSelect('ma.verificationCode', 'verification_code');
      queryObject.addSelect('ma.createdAt', 'created_at');
      queryObject.addSelect('ma.updatedAt', 'updated_at');
      queryObject.addSelect('ma.lastLoginAt', 'last_login_at');
      queryObject.addSelect('ma.status', 'status');
      queryObject.addSelect('mgm.groupName', 'group_name');
      queryObject.addSelect('mgm.groupCode', 'group_code');
      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.andWhere('ma.name LIKE :name', { name: `%${inputParams.keyword}%` });
      }
      //@ts-ignore;              
      this.getWhereClause(queryObject, inputParams, extraConfig);
      //@ts-ignore;
      this.getOrderByClause(queryObject, inputParams, extraConfig);
      queryObject.offset(startIdx);
      queryObject.limit(recLimit);

      const data = await queryObject.getRawMany();

      if (!_.isArray(data) || _.isEmpty(data)) {
        throw new Error('No records found.');
      }

      let val;
      if (_.isArray(data) && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          val = row.created_at;
          //@ts-ignore;
          val = this.general.getClientDateTime(val, row, {
            index: i,
            field: 'created_at',
            params: inputParams,
            request: this.requestObj,
          });
          data[i].created_at = val;

          val = row.updated_at;
          //@ts-ignore;
          val = this.general.getClientDateTime(val, row, {
            index: i,
            field: 'updated_at',
            params: inputParams,
            request: this.requestObj,
          });
          data[i].updated_at = val;

          val = row.last_login_at;
          //@ts-ignore;
          val = this.general.getClientDateTime(val, row, {
            index: i,
            field: 'last_login_at',
            params: inputParams,
            request: this.requestObj,
          });
          data[i].last_login_at = val;
        }
      }

      const success = 1;
      const message = 'Records found.';

      const queryResult = {
        success,
        message,
        data,
      };
      this.blockResult = queryResult;
    } catch (err) {
      this.blockResult.success = 0;
      this.blockResult.message = err;
      this.blockResult.data = [];
    }
    inputParams.get_admin_list = this.blockResult.data;

    return inputParams;
  }

  /**
   * finishSuccess method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  finishSuccess(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('Admin list found.'),
      fields: [],
    };
    settingFields.fields = [
      'admin_id',
      'name',
      'email',
      'username',
      'phone_number',
      'group_id',
      'verification_code',
      'created_at',
      'updated_at',
      'last_login_at',
      'status',
      'group_name',
      'group_code',
    ];

    const outputKeys = [
      'get_admin_list',
    ];

    const outputData: any = {};
    outputData.settings = { ...settingFields, ...this.settingsParams };
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'admin_list';

    funcData.output_keys = outputKeys;
    funcData.multiple_keys = this.multipleKeys;
    return this.response.outputResponse(outputData, funcData);
  }

  /**
   * finishFailure method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  finishFailure(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('No admin list found.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'admin_list',
      },
    );
  }
}
