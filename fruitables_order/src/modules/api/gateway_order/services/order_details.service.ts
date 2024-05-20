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
import { OrderItemEntity } from 'src/entities/order-item.entity';
import { BaseService } from 'src/services/base.service';

import {
  rabbitmqUserConfig,
  rabbitmqProductConfig,
} from 'src/config/all-rabbitmq-core';
@Injectable()
export class OrderDetailsService extends BaseService {
  @Client({
    ...rabbitmqUserConfig,
    options: {
      ...rabbitmqUserConfig.options,
    },
  })
  rabbitmqRmqGetUserAddressClient: ClientProxy;

  @Client({
    ...rabbitmqProductConfig,
    options: {
      ...rabbitmqProductConfig.options,
    },
  })
  rabbitmqRmqGetProductListClient: ClientProxy;

  protected readonly log = new LoggerHandler(
    OrderDetailsService.name,
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
  @InjectRepository(OrderItemEntity)
  protected orderItemEntityRepo: Repository<OrderItemEntity>;

  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.singleKeys = [
      'get_order_details',
      'custom_function',
      'prepare_output',
    ];
    this.multipleKeys = [
      'external_api',
      'get_order_item_details',
      'call_product_list',
    ];
  }

  /**
   * startOrderDetails method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startOrderDetails(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;

      inputParams = await this.getOrderDetails(inputParams);
      if (!_.isEmpty(inputParams.get_order_details)) {
        inputParams = await this.externalApi(inputParams);
        inputParams = await this.getOrderItemDetails(inputParams);
        inputParams = await this.customFunction(inputParams);
        inputParams = await this.callProductList(inputParams);
        inputParams = await this.prepareOutput(inputParams);
        outputResponse = this.finishSuccess(inputParams);
      } else {
        outputResponse = this.finishFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> order_details >>', err);
    }
    return outputResponse;
  }

  /**
   * getOrderDetails method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getOrderDetails(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.ordersEntityRepo.createQueryBuilder('o');

      queryObject.select('o.iUserAddressId', 'o_user_address_id');
      queryObject.addSelect('o.iItemCount', 'o_item_count');
      queryObject.addSelect('o.fCost', 'o_cost');
      queryObject.addSelect('o.fShippingCost', 'o_shipping_cost');
      queryObject.addSelect('o.fTotalCost', 'o_total_cost');
      queryObject.addSelect('o.eStatus', 'o_status');
      queryObject.addSelect('o.updatedAt', 'o_updatedAt');
      queryObject.addSelect('o.createdAt', 'o_createdAt_1');
      if (!custom.isEmpty(inputParams.id)) {
        queryObject.andWhere('o.id = :id', { id: inputParams.id });
      }
      if (!custom.isEmpty(inputParams.user_id)) {
        queryObject.andWhere('o.iUserId = :iUserId', {
          iUserId: inputParams.user_id,
        });
      }

      const data: any = await queryObject.getRawOne();
      if (!_.isObject(data) || _.isEmpty(data)) {
        throw new Error('No records found.');
      }

      let val;
      if (_.isObject(data) && !_.isEmpty(data)) {
        const row: any = data;
        val = row.o_updatedAt;
        //@ts-ignore;
        val = await this.general.getCustomDate(val, row, {
          field: 'o_updatedAt',
          params: inputParams,
          request: this.requestObj,
        });
        data['o_updatedAt'] = val;

        val = row.o_createdAt_1;
        //@ts-ignore;
        val = await this.general.getCustomDate(val, row, {
          field: 'o_createdAt_1',
          params: inputParams,
          request: this.requestObj,
        });
        data['o_createdAt_1'] = val;
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
    inputParams.get_order_details = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

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
      id: inputParams.o_user_address_id,
    };

    try {
      console.log('emiting from here rabbitmq!');
      apiResult = await new Promise<any>((resolve, reject) => {
        this.rabbitmqRmqGetUserAddressClient
          .send('rmq_get_user_address', extInputParams)
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

    inputParams.external_api = apiResult.settings.success ? apiResult.data : [];
    inputParams = this.response.assignSingleRecord(inputParams, apiResult.data);

    if (_.isObject(apiInfo) && !_.isEmpty(apiInfo)) {
      Object.keys(apiInfo).forEach((key) => {
        const infoKey = `' . external_api . '_0`;
        inputParams[infoKey] = apiInfo[key];
      });
    }

    return inputParams;
  }

  /**
   * getOrderItemDetails method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getOrderItemDetails(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.orderItemEntityRepo.createQueryBuilder('oi');

      queryObject.select('oi.iProductId', 'oi_product_id');
      queryObject.addSelect('oi.iOrderQty', 'oi_order_qty');
      queryObject.addSelect('oi.fPrice', 'oi_price');
      queryObject.addSelect('oi.fTotalPrice', 'oi_total_price');
      queryObject.addSelect("''", 'p_product_name');
      queryObject.addSelect("''", 'product_price');
      queryObject.addSelect("''", 'p_product_image');
      queryObject.addSelect("''", 'product_rating');
      if (!custom.isEmpty(inputParams.id)) {
        queryObject.andWhere('oi.iOrderId = :iOrderId', {
          iOrderId: inputParams.id,
        });
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
    inputParams.get_order_item_details = this.blockResult.data;

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
   * callProductList method is used to process external API flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async callProductList(inputParams: any) {
    this.blockResult = {};
    let apiResult: ResponseHandlerInterface = {};
    let apiInfo = {};
    let success;
    let message;

    const extInputParams: any = {
      ids: inputParams.p_ids,
    };

    try {
      console.log('emiting from here rabbitmq!');
      apiResult = await new Promise<any>((resolve, reject) => {
        this.rabbitmqRmqGetProductListClient
          .send('rmq_get_product_list', extInputParams)
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

    inputParams.call_product_list = apiResult.settings.success
      ? apiResult.data
      : [];
    inputParams = this.response.assignSingleRecord(inputParams, apiResult.data);

    if (_.isObject(apiInfo) && !_.isEmpty(apiInfo)) {
      Object.keys(apiInfo).forEach((key) => {
        const infoKey = `' . call_product_list . '_0`;
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
   * finishSuccess method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  finishSuccess(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('Order details found. '),
      fields: [],
    };
    settingFields.fields = [
      'o_user_address_id',
      'o_item_count',
      'o_cost',
      'o_shipping_cost',
      'o_total_cost',
      'o_status',
      'o_updatedAt',
      'o_createdAt_1',
      'get_address',
      'land_mark',
      'address',
      'state_name',
      'countr_name',
      'pin_code',
      'first_name',
      'last_name',
      'phone_number',
      'dial_code',
      'city',
      'oi_product_id',
      'oi_order_qty',
      'oi_price',
      'oi_total_price',
      'p_product_name',
      'product_price',
      'p_product_image',
      'product_rating',
    ];

    const outputKeys = [
      'get_order_details',
      'external_api',
      'get_order_item_details',
    ];
    const outputAliases = {
      o_user_address_id: 'user_address_id',
      o_item_count: 'order_item_count',
      o_cost: 'order_item_cost',
      o_shipping_cost: 'shipping_cost',
      o_total_cost: 'total_cost',
      o_status: 'order_status',
      o_updatedAt: 'updatedAt',
      o_createdAt_1: 'createdAt',
      external_api: 'address',
      oi_product_id: 'product_id',
      oi_order_qty: 'order_qty',
      oi_price: 'price',
      oi_total_price: 'total_price',
      p_product_name: 'product_name',
      p_product_image: 'product_image',
    };
    const outputObjects = ['get_order_details'];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'order_details';

    funcData.output_keys = outputKeys;
    funcData.output_alias = outputAliases;
    funcData.output_objects = outputObjects;
    funcData.single_keys = this.singleKeys;
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
      success: 0,
      message: custom.lang('Order not found.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'order_details',
      },
    );
  }
}
