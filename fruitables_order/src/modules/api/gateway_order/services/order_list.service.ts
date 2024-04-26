interface AuthObject {
  user: any;
}
import { Inject, Injectable, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Client, ClientProxy } from '@nestjs/microservices';

import * as _ from 'lodash';
import * as custom from 'src/utilities/custom-helper';
import { LoggerHandler } from 'src/utilities/logger-handler';
import { BlockResultDto, SettingsParamsDto } from 'src/common/dto/common.dto';

import { ResponseLibrary } from 'src/utilities/response-library';
import { CitGeneralLibrary } from 'src/utilities/cit-general-library';
import { ResponseHandlerInterface } from 'src/utilities/response-handler';

import { OrdersEntity } from 'src/entities/orders.entity';
import { BaseService } from 'src/services/base.service';

import { rabbitmqUserConfig } from 'src/config/all-rabbitmq-core';
@Injectable()
export class OrderListService extends BaseService {
  
  @Client({
    ...rabbitmqUserConfig,
    options: {
      ...rabbitmqUserConfig.options,
    }
  })
  rabbitmqRmqGetAddressListClient: ClientProxy;
  
  protected readonly log = new LoggerHandler(
    OrderListService.name,
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
    @InjectRepository(OrdersEntity)
  protected ordersEntityRepo: Repository<OrdersEntity>;
  
  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.singleKeys = [
      'custom_function',
    ];
    this.multipleKeys = [
      'get_order_list',
      'external_api',
      'prepare_output',
    ];
  }

  /**
   * startOrderList method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startOrderList(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.getOrderList(inputParams);
      if (!_.isEmpty(inputParams.get_order_list)) {
      inputParams = await this.customFunction(inputParams);
      inputParams = await this.externalApi(inputParams);
      inputParams = await this.prepareOutput(inputParams);
        outputResponse = this.ordersFinishSuccess1(inputParams);
      } else {
        outputResponse = this.ordersFinishSuccess(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> order_list >>', err);
    }
    return outputResponse;
  }
  

  /**
   * getOrderList method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getOrderList(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.ordersEntityRepo.createQueryBuilder('o');

      queryObject.select('o.iItemCount', 'o_item_count');
      queryObject.addSelect('o.fCost', 'o_cost');
      queryObject.addSelect('o.fShippingCost', 'o_shipping_cost');
      queryObject.addSelect('o.iUserAddressId', 'o_user_address_id');
      queryObject.addSelect('o.fTotalCost', 'o_total_cost');
      queryObject.addSelect('o.eStatus', 'o_status');
      queryObject.addSelect("''", 'a_land_mark');
      queryObject.addSelect("''", 'a_address');
      queryObject.addSelect("''", 'a_state_name');
      queryObject.addSelect("''", 'a_countr_name');
      queryObject.addSelect("''", 'a_pin_code');
      queryObject.addSelect('o.id', 'o_id');
      if (!custom.isEmpty(inputParams.user_id)) {
        queryObject.andWhere('o.iUserId = :iUserId', { iUserId: inputParams.user_id });
      }

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
    inputParams.get_order_list = this.blockResult.data;

    return inputParams;
  }

  /**
   * customFunction method is used to process custom function.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async customFunction(inputParams: any) {
    let formatData: any = {};
    try {
      //@ts-ignore
      const result = await this.prepareData(inputParams);

      formatData = this.response.assignFunctionResponse(result);
      inputParams.custom_function = formatData;

      inputParams = this.response.assignSingleRecord(inputParams, formatData);
    } catch (err) {
      this.log.error(err);
    }
    return inputParams;
  }

  /**
   * externalApi method is used to process external API flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async externalApi(inputParams: any) {
    
    this.blockResult = {};
    let apiResult: ResponseHandlerInterface = {};
    let apiInfo = {};
    let success;
    let message;
    
    
    const extInputParams: any = {
      ids: '',
    };
        
    try {
      console.log('emiting from here rabbitmq!');            
      apiResult = await new Promise<any>((resolve, reject) => {
        this.rabbitmqRmqGetAddressListClient
          .send('rmq_get_address_list', extInputParams)
          .pipe()
          .subscribe((data: any) => {
          resolve(data);
        });
      });

      if (!apiResult?.settings?.success) {
        throw new Error(apiResult?.settings?.message);
      }
      this.blockResult.data = apiResult.data;

      success = apiResult.settings.success;
      message = apiResult.settings.message;
    } catch (err) {
      success = 0;
      message = err;
    }

    this.blockResult.success = success;
    this.blockResult.message = message;

    inputParams.external_api = (apiResult.settings.success) ? apiResult.data : [];
    inputParams = this.response.assignSingleRecord(inputParams, apiResult.data);

    if (_.isObject(apiInfo) && !_.isEmpty(apiInfo)) {
      Object.keys(apiInfo).forEach(key => {
        const infoKey = `' . external_api . '_0`;
        inputParams[infoKey] = apiInfo[key];
      });
    }

    return inputParams;
  }

  /**
   * prepareOutput method is used to process custom function.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async prepareOutput(inputParams: any) {
    let formatData: any = {};
    try {
      //@ts-ignore
      const result = await this.prepareOutputData(inputParams);

      formatData = this.response.assignFunctionResponse(result);
      inputParams.prepare_output = formatData;

      inputParams = this.response.assignSingleRecord(inputParams, formatData);
    } catch (err) {
      this.log.error(err);
    }
    return inputParams;
  }

  /**
   * ordersFinishSuccess1 method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  ordersFinishSuccess1(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('list found'),
      fields: [],
    };
    settingFields.fields = [
      'o_item_count',
      'o_cost',
      'o_shipping_cost',
      'o_user_address_id',
      'o_total_cost',
      'o_status',
      'a_land_mark',
      'a_address',
      'a_state_name',
      'a_countr_name',
      'a_pin_code',
      'o_id',
    ];

    const outputKeys = [
      'get_order_list',
    ];
    const outputAliases = {
      o_item_count: 'item_count',
      o_cost: 'cost',
      o_shipping_cost: 'shipping_cost',
      o_user_address_id: 'user_address_id',
      o_total_cost: 'total_cost',
      o_status: 'status',
      a_land_mark: 'land_mark',
      a_address: 'address',
      a_state_name: 'state_name',
      a_countr_name: 'countr_name',
      a_pin_code: 'pin_code',
      o_id: 'order_id',
    };

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'order_list';

    funcData.output_keys = outputKeys;
    funcData.output_alias = outputAliases;
    funcData.single_keys = this.singleKeys;
    funcData.multiple_keys = this.multipleKeys;
    return this.response.outputResponse(outputData, funcData);
  }

  /**
   * ordersFinishSuccess method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  ordersFinishSuccess(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('List not found.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'order_list',
      },
    );
  }
}
