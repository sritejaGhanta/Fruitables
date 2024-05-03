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
import { BaseService } from 'src/services/base.service';

@Injectable()
export class AdminProfileUpdateService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    AdminProfileUpdateService.name,
  ).getInstance();
  protected inputParams: object = {};
  protected blockResult: BlockResultDto;
  protected settingsParams: SettingsParamsDto;
  protected singleKeys: any[] = [];
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
    this.singleKeys = [
      'update_admin_profile',
    ];
    this.multipleKeys = [
      'check_admin_profile_by_email',
    ];
  }

  /**
   * startAdminProfileUpdate method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startAdminProfileUpdate(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.checkAdminProfileByEmail(inputParams);
      if (!_.isEmpty(inputParams.check_admin_profile_by_email)) {
        outputResponse = this.finishFailure(inputParams);
      } else {
      inputParams = await this.updateAdminProfile(inputParams);
      if (!_.isEmpty(inputParams.update_admin_profile)) {
        outputResponse = this.finishSuccess(inputParams);
      } else {
        outputResponse = this.updateFailure(inputParams);
      }
      }
    } catch (err) {
      this.log.error('API Error >> admin_profile_update >>', err);
    }
    return outputResponse;
  }
  

  /**
   * checkAdminProfileByEmail method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async checkAdminProfileByEmail(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.adminEntityRepo.createQueryBuilder('ma');

      queryObject.select('id', 'ma_id');
      if (!custom.isEmpty(inputParams.email)) {
        queryObject.andWhere('email = :email', { email: inputParams.email });
      }
      queryObject.andWhere('id <> :id', { id: this.requestObj.user.id });

      const data = await queryObject.getRawMany();
      if (!_.isArray(data) || _.isEmpty(data)) {
        throw new Error('No records found.');
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
    inputParams.check_admin_profile_by_email = this.blockResult.data;

    return inputParams;
  }

  /**
   * finishFailure method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  finishFailure(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 0,
      message: custom.lang('Email  already exists.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'admin_profile_update',
      },
    );
  }

  /**
   * updateAdminProfile method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async updateAdminProfile(inputParams: any) {
    this.blockResult = {};
    try {                
      

      const queryColumns: any = {};
      if ('name' in inputParams) {
        queryColumns.name = inputParams.name;
      }
      if ('email' in inputParams) {
        queryColumns.email = inputParams.email;
      }
      if ('dial_code' in inputParams) {
        queryColumns.dialCode = inputParams.dial_code;
      }
      if ('phone_number' in inputParams) {
        queryColumns.phoneNumber = inputParams.phone_number;
      }
      queryColumns.updatedAt = () => 'NOW()';

      const queryObject = this.adminEntityRepo
        .createQueryBuilder()
        .update(AdminEntity)
        .set(queryColumns);
      queryObject.andWhere('id = :id', { id: this.requestObj.user.id });
      const res = await queryObject.execute();
      const data = {
        affected_rows: res.affected,
      };

      const success = 1;
      const message = 'Record(s) updated.';

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
    inputParams.update_admin_profile = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

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
      message: custom.lang('Admin profile updated successfully.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'admin_profile_update',
      },
    );
  }

  /**
   * updateFailure method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  updateFailure(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 0,
      message: custom.lang('Something went wrong.Please try again.'),
      fields: [],
    };
    settingFields.fields = [
      'ma_id',
    ];

    const outputKeys = [
      'check_admin_profile_by_email',
    ];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'admin_profile_update';

    funcData.output_keys = outputKeys;
    funcData.single_keys = this.singleKeys;
    funcData.multiple_keys = this.multipleKeys;
    return this.response.outputResponse(outputData, funcData);
  }
}
