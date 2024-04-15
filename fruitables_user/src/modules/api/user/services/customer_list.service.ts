interface AuthObject {
  user: any;
}
import { Inject, Injectable, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import * as _ from 'lodash';
import * as custom from 'src/utilities/custom-helper';
import { LoggerHandler } from 'src/utilities/logger-handler';
import { BlockResultDto, SettingsParamsDto } from 'src/common/dto/common.dto';import { FileFetchDto } from 'src/common/dto/amazon.dto';

import { ResponseLibrary } from 'src/utilities/response-library';
import { CitGeneralLibrary } from 'src/utilities/cit-general-library';


import { CustomerEntity } from 'src/entities/customer.entity';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class CustomerListService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    CustomerListService.name,
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
    @InjectRepository(CustomerEntity)
  protected customerEntityRepo: Repository<CustomerEntity>;
  
  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.multipleKeys = [
      'get_customer_list',
    ];
  }

  /**
   * startCustomerList method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startCustomerList(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.getCustomerList(inputParams);
      if (!_.isEmpty(inputParams.get_customer_list)) {
        outputResponse = this.finishSuccess(inputParams);
      } else {
        outputResponse = this.finishFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> customer_list >>', err);
    }
    return outputResponse;
  }
  

  /**
   * getCustomerList method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getCustomerList(inputParams: any) {
    this.blockResult = {};
    try {
      const extraConfig = {
        table_name: 'mod_customer',
        table_alias: 'mc',
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

      let queryObject = this.customerEntityRepo.createQueryBuilder('mc');

      //@ts-ignore;              
      this.getWhereClause(queryObject, inputParams, extraConfig);

      const totalCount = await queryObject.getCount();
      this.settingsParams = custom.getPagination(totalCount, pageIndex, recLimit);
      if (!totalCount) {
        throw new Error('No records found.');
      }

      queryObject = this.customerEntityRepo.createQueryBuilder('mc');

      queryObject.select('id', 'mc_id');
      queryObject.addSelect('firstName', 'mc_first_name');
      queryObject.addSelect('lastName', 'mc_last_name');
      queryObject.addSelect('email', 'mc_email');
      queryObject.addSelect('profileImage', 'mc_profile_image');
      queryObject.addSelect('isEmailVerified', 'mc_is_email_verified');
      queryObject.addSelect('status', 'mc_status');
      queryObject.addSelect('createdAt', 'mc_created_at');
      queryObject.addSelect('CONCAT_WS(\'\',dialCode,phonenumber)', 'mc_phone_number');
      queryObject.addSelect('dialCode', 'mc_dial_code');
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

      let fileConfig: FileFetchDto;
      let val;
      if (_.isArray(data) && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          val = row.mc_profile_image;
          fileConfig = {};
          fileConfig.source = 'local';
          fileConfig.path = 'profile_image';
          fileConfig.image_name = val;
          fileConfig.extensions = await this.general.getConfigItem('allowed_extensions');
          fileConfig.color = 'FFFFFF';
          fileConfig.no_img_req = false;
          val = await this.general.getFile(fileConfig, inputParams);
          data[i].mc_profile_image = val;

          val = row.mc_created_at;
          //@ts-ignore;
          val = this.general.getClientDateTime(val, row, {
            index: i,
            field: 'mc_created_at',
            params: inputParams,
            request: this.requestObj,
          });
          data[i].mc_created_at = val;
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
    inputParams.get_customer_list = this.blockResult.data;

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
      message: custom.lang('Customer list found.'),
      fields: [],
    };
    settingFields.fields = [
      'mc_id',
      'mc_first_name',
      'mc_last_name',
      'mc_email',
      'mc_profile_image',
      'mc_is_email_verified',
      'mc_status',
      'mc_created_at',
      'mc_phone_number',
      'mc_dial_code',
    ];

    const outputKeys = [
      'get_customer_list',
    ];

    const outputData: any = {};
    outputData.settings = { ...settingFields, ...this.settingsParams };
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'customer_list';

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
      message: custom.lang('Customer list not found.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'customer_list',
      },
    );
  }
}
