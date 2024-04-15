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
export class VerifyAdminEmailService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    VerifyAdminEmailService.name,
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
      'parse_token_data',
      'get_admin_by_email_code',
      'update_admin_email_verified',
    ];
  }

  /**
   * startVerifyAdminEmail method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startVerifyAdminEmail(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.parseTokenData(inputParams);
      if (!custom.isEmpty(inputParams.verify_code) && !custom.isEmpty(inputParams.admin_email)) {
      inputParams = await this.getAdminByEmailCode(inputParams);
      if (!_.isEmpty(inputParams.get_admin_by_email_code)) {
      inputParams = await this.updateAdminEmailVerified(inputParams);
        outputResponse = this.finishSuccess(inputParams);
      } else {
        outputResponse = this.matchFailure(inputParams);
      }
      } else {
        outputResponse = this.tokenFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> verify_admin_email >>', err);
    }
    return outputResponse;
  }
  

  /**
   * parseTokenData method is used to process custom function.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async parseTokenData(inputParams: any) {
    let formatData: any = {};
    try {
      //@ts-ignore
      const result = await this.decodeAdminVerifyToken(inputParams);

      formatData = this.response.assignFunctionResponse(result);
      inputParams.parse_token_data = formatData;

      inputParams = this.response.assignSingleRecord(inputParams, formatData);
    } catch (err) {
      this.log.error(err);
    }
    return inputParams;
  }

  /**
   * getAdminByEmailCode method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getAdminByEmailCode(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.adminEntityRepo.createQueryBuilder('ma');

      queryObject.select('id', 'ma_id');
      queryObject.addSelect('isEmailVerified', 'ma_is_email_verified');
      queryObject.addSelect("'1'", 'custom_set_password');
      if (!custom.isEmpty(inputParams.admin_email)) {
        queryObject.andWhere('email = :email', { email: inputParams.admin_email });
      }
      if (!custom.isEmpty(inputParams.verify_code)) {
        queryObject.andWhere('verificationCode = :verificationCode', { verificationCode: inputParams.verify_code });
      }

      const data: any = await queryObject.getRawOne();
      if (!_.isObject(data) || _.isEmpty(data)) {
        throw new Error('No records found.');
      }

      let val;
      if (_.isObject(data) && !_.isEmpty(data)) {
        const row: any = data;
          val = row.custom_set_password;
          //@ts-ignore;
          val = this.setPasswordFlag(val, row, {
            field: 'custom_set_password',
            params: inputParams,
            request: this.requestObj,
          })
          data['custom_set_password'] = val;
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
    inputParams.get_admin_by_email_code = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * updateAdminEmailVerified method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async updateAdminEmailVerified(inputParams: any) {
    this.blockResult = {};
    try {                
      

      const queryColumns: any = {};
      queryColumns.isEmailVerified = 'Yes';
      queryColumns.verificationCode = () => 'NULL';

      const queryObject = this.adminEntityRepo
        .createQueryBuilder()
        .update(AdminEntity)
        .set(queryColumns);
      if (!custom.isEmpty(inputParams.ma_id)) {
        queryObject.andWhere('id = :id', { id: inputParams.ma_id });
      }
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
    inputParams.update_admin_email_verified = this.blockResult.data;
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
      message: custom.lang('Email verified successfully.'),
      fields: [],
    };
    settingFields.fields = [
      'ma_id',
      'custom_set_password',
    ];

    const outputKeys = [
      'get_admin_by_email_code',
    ];
    const outputAliases = {
      ma_id: 'admin_id',
      custom_set_password: 'set_password',
    };
    const outputObjects = [
      'get_admin_by_email_code',
    ];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'verify_admin_email';

    funcData.output_keys = outputKeys;
    funcData.output_alias = outputAliases;
    funcData.output_objects = outputObjects;
    funcData.single_keys = this.singleKeys;
    return this.response.outputResponse(outputData, funcData);
  }

  /**
   * matchFailure method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  matchFailure(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 0,
      message: custom.lang('Invalid verification token. Please try again.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'verify_admin_email',
      },
    );
  }

  /**
   * tokenFailure method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  tokenFailure(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 0,
      message: custom.lang('Invalid verification token. Please try again.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'verify_admin_email',
      },
    );
  }
}
