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


import { CustomerEntity } from 'src/entities/customer.entity';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class VerifyCustomerEmailService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    VerifyCustomerEmailService.name,
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
    @InjectRepository(CustomerEntity)
  protected customerEntityRepo: Repository<CustomerEntity>;
  
  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.singleKeys = [
      'decode_verify_token',
      'get_customer_by_verify_code',
      'queryupdate_customer_email_verified',
    ];
  }

  /**
   * startVerifyCustomerEmail method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startVerifyCustomerEmail(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.decodeVerifyToken(inputParams);
      if (!custom.isEmpty(inputParams.verify_code) && !custom.isEmpty(inputParams.customer_email)) {
      inputParams = await this.getCustomerByVerifyCode(inputParams);
      if (!_.isEmpty(inputParams.get_customer_by_verify_code) && !custom.isEmpty(inputParams.customer_email)) {
      inputParams = await this.queryupdateCustomerEmailVerified(inputParams);
        outputResponse = this.modCustomerFinishSuccess(inputParams);
      } else {
        outputResponse = this.matchFailure(inputParams);
      }
      } else {
        outputResponse = this.tokenFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> verify_customer_email >>', err);
    }
    return outputResponse;
  }
  

  /**
   * decodeVerifyToken method is used to process custom function.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async decodeVerifyToken(inputParams: any) {
    let formatData: any = {};
    try {
      //@ts-ignore
      const result = await this.decodeCustomerVerifyToken(inputParams);

      formatData = this.response.assignFunctionResponse(result);
      inputParams.decode_verify_token = formatData;

      inputParams = this.response.assignSingleRecord(inputParams, formatData);
    } catch (err) {
      this.log.error(err);
    }
    return inputParams;
  }

  /**
   * getCustomerByVerifyCode method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getCustomerByVerifyCode(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.customerEntityRepo.createQueryBuilder('mc');

      queryObject.select('id', 'mc_id');
      queryObject.addSelect('isEmailVerified', 'mc_is_email_verified');
      queryObject.addSelect("'1'", 'custom_set_password');
      if (!custom.isEmpty(inputParams.customer_email)) {
        queryObject.andWhere('email = :email', { email: inputParams.customer_email });
      }
      if (!custom.isEmpty(inputParams.verify_code)) {
        queryObject.andWhere('verificationCode = :verificationCode', { verificationCode: inputParams.verify_code });
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
    inputParams.get_customer_by_verify_code = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * queryupdateCustomerEmailVerified method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async queryupdateCustomerEmailVerified(inputParams: any) {
    this.blockResult = {};
    try {                
      

      const queryColumns: any = {};
      queryColumns.isEmailVerified = 'Yes';
      queryColumns.verificationCode = () => 'NULL';

      const queryObject = this.customerEntityRepo
        .createQueryBuilder()
        .update(CustomerEntity)
        .set(queryColumns);
      if (!custom.isEmpty(inputParams.mc_id)) {
        queryObject.andWhere('id = :id', { id: inputParams.mc_id });
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
    inputParams.queryupdate_customer_email_verified = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * modCustomerFinishSuccess method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  modCustomerFinishSuccess(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('Email verified successfully.'),
      fields: [],
    };
    settingFields.fields = [
      'mc_id',
      'custom_set_password',
    ];

    const outputKeys = [
      'get_customer_by_verify_code',
    ];
    const outputAliases = {
      mc_id: 'customer_id',
      custom_set_password: 'set_password',
    };
    const outputObjects = [
      'get_customer_by_verify_code',
    ];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'verify_customer_email';

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
        name: 'verify_customer_email',
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
        name: 'verify_customer_email',
      },
    );
  }
}
