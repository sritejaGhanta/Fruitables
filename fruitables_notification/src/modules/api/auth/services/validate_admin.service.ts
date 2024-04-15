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
export class ValidateAdminService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    ValidateAdminService.name,
  ).getInstance();
  protected inputParams: object = {};
  protected blockResult: BlockResultDto;
  protected settingsParams: SettingsParamsDto;
  protected singleKeys: any[] = [];
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
      'fetch_admin_data',
    ];
  }

  /**
   * startValidateAdmin method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startValidateAdmin(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.fetchAdminData(inputParams);
      if (!_.isEmpty(inputParams.fetch_admin_data)) {
      if (inputParams.ma_is_email_verified === 'Yes') {
      if (inputParams.ma_status === 'Active') {
        outputResponse = this.finishSuccess(inputParams);
      } else {
        outputResponse = this.statusFailure(inputParams);
      }
      } else {
        outputResponse = this.accountFailure(inputParams);
      }
      } else {
        outputResponse = this.finishFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> validate_admin >>', err);
    }
    return outputResponse;
  }
  

  /**
   * fetchAdminData method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async fetchAdminData(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.adminEntityRepo.createQueryBuilder('ma');

      queryObject.select('name', 'ma_name');
      queryObject.addSelect('email', 'ma_email');
      queryObject.addSelect('isEmailVerified', 'ma_is_email_verified');
      queryObject.addSelect('status', 'ma_status');
      if (!custom.isEmpty(inputParams.email)) {
        queryObject.andWhere('email = :email', { email: inputParams.email });
      }

      const data: any = await queryObject.getRawOne();
      if (!_.isObject(data) || _.isEmpty(data)) {
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
    inputParams.fetch_admin_data = this.blockResult.data;
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
      message: custom.lang('Your email is exist.'),
      fields: [],
    };
    settingFields.fields = [
      'ma_name',
    ];

    const outputKeys = [
      'fetch_admin_data',
    ];
    const outputAliases = {
      ma_name: 'name',
    };
    const outputObjects = [
      'fetch_admin_data',
    ];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'validate_admin';

    funcData.output_keys = outputKeys;
    funcData.output_alias = outputAliases;
    funcData.output_objects = outputObjects;
    funcData.single_keys = this.singleKeys;
    return this.response.outputResponse(outputData, funcData);
  }

  /**
   * statusFailure method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  statusFailure(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 0,
      message: custom.lang('Your account is not active. Please contact administrator.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'validate_admin',
      },
    );
  }

  /**
   * accountFailure method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  accountFailure(inputParams: any) {
    const settingFields = {
      status: 200,
      success: -2,
      message: custom.lang('Your account is not verified.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'validate_admin',
      },
    );
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
      message: custom.lang('Enter the registered email address.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'validate_admin',
      },
    );
  }
}
