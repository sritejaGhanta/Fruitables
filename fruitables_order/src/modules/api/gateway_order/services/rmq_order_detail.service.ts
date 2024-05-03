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
export class RmqOrderDetailService extends BaseService {
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

  @Client({
    ...rabbitmqUserConfig,
    options: {
      ...rabbitmqUserConfig.options,
    },
  })
  rabbitmqRmqUserDetailsClient: ClientProxy;

  protected readonly log = new LoggerHandler(
    RmqOrderDetailService.name,
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
    this.singleKeys = ['get_user_order_details'];
    this.multipleKeys = [
      'get_orders_item_details',
      'custom_function',
      'get_user_address',
      'get_rmq_product_details',
      'get_rmq_user_details',
    ];
  }

  /**
   * startRmqOrderDetail method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startRmqOrderDetail(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;

      inputParams = await this.getUserOrderDetails(inputParams);
      if (!_.isEmpty(inputParams.get_user_order_details)) {
        inputParams = await this.getOrdersItemDetails(inputParams);
        inputParams = await this.customFunction(inputParams);
        inputParams = await this.getUserAddress(inputParams);
        inputParams = await this.getRmqProductDetails(inputParams);
        inputParams = await this.getRmqUserDetails(inputParams);
        outputResponse = this.ordersFinishSuccess1(inputParams);
      } else {
        outputResponse = this.ordersFinishSuccess(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> rmq_order_detail >>', err);
    }
    return outputResponse;
  }

  /**
   * getUserOrderDetails method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getUserOrderDetails(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.ordersEntityRepo.createQueryBuilder('o');

      queryObject.select('o.iUserId', 'o_user_id');
      queryObject.addSelect('o.createdAt', 'o_createdAt');
      queryObject.addSelect('o.fTotalCost', 'o_total_cost');
      queryObject.addSelect('o.id', 'o_id');
      queryObject.addSelect('o.iUserAddressId', 'o_user_address_id');
      queryObject.addSelect('o.fShippingCost', 'o_shipping_cost');
      queryObject.addSelect('o.eStatus', 'o_status');
      if (!custom.isEmpty(inputParams.order_id)) {
        queryObject.andWhere('o.id = :id', { id: inputParams.order_id });
      }

      const data: any = await queryObject.getRawOne();
      if (!_.isObject(data) || _.isEmpty(data)) {
        throw new Error('No records found.');
      }

      let val;
      if (_.isObject(data) && !_.isEmpty(data)) {
        const row: any = data;
        val = row.o_createdAt;
        //@ts-ignore;
        val = await this.general.getCustomDate(val, row, {
          field: 'o_createdAt',
          params: inputParams,
          request: this.requestObj,
        });
        data['o_createdAt'] = val;
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
    inputParams.get_user_order_details = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * getOrdersItemDetails method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getOrdersItemDetails(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.orderItemEntityRepo.createQueryBuilder('oi');

      queryObject.select('oi.iProductId', 'oi_product_id');
      queryObject.addSelect('oi.iOrderQty', 'oi_order_qty');
      queryObject.addSelect('oi.fPrice', 'oi_price');
      queryObject.addSelect('oi.iOrderid', 'oi_orderid');
      queryObject.addSelect('oi.fTotalPrice', 'oi_total_price');
      if (!custom.isEmpty(inputParams.order_id)) {
        queryObject.andWhere('oi.iOrderid = :iOrderid', {
          iOrderid: inputParams.order_id,
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
    inputParams.get_orders_item_details = this.blockResult.data;

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
      const result = await this.getProductIds(inputParams);

      formatData = this.response.assignFunctionResponse(result);
      inputParams.custom_function = formatData;

      inputParams = this.response.assignSingleRecord(inputParams, formatData);
    } catch (err) {
      this.log.error(err);
    }
    return inputParams;
  }

  /**
   * getUserAddress method is used to process external API flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getUserAddress(inputParams: any) {
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

    inputParams.get_user_address = apiResult.settings.success
      ? apiResult.data
      : [];
    inputParams = this.response.assignSingleRecord(inputParams, apiResult.data);

    if (_.isObject(apiInfo) && !_.isEmpty(apiInfo)) {
      Object.keys(apiInfo).forEach((key) => {
        const infoKey = `' . get_user_address . '_0`;
        inputParams[infoKey] = apiInfo[key];
      });
    }

    return inputParams;
  }

  /**
   * getRmqProductDetails method is used to process external API flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getRmqProductDetails(inputParams: any) {
    this.blockResult = {};
    let apiResult: ResponseHandlerInterface = {};
    let apiInfo = {};
    let success;
    let message;

    const extInputParams: any = {
      ids: inputParams.ids,
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

    inputParams.get_rmq_product_details = apiResult.settings.success
      ? apiResult.data
      : [];
    inputParams = this.response.assignSingleRecord(inputParams, apiResult.data);

    if (_.isObject(apiInfo) && !_.isEmpty(apiInfo)) {
      Object.keys(apiInfo).forEach((key) => {
        const infoKey = `' . get_rmq_product_details . '_0`;
        inputParams[infoKey] = apiInfo[key];
      });
    }

    return inputParams;
  }

  /**
   * getRmqUserDetails method is used to process external API flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getRmqUserDetails(inputParams: any) {
    this.blockResult = {};
    let apiResult: ResponseHandlerInterface = {};
    let apiInfo = {};
    let success;
    let message;

    const extInputParams: any = {
      id: inputParams.o_user_id,
    };

    try {
      console.log('emiting from here rabbitmq!');
      apiResult = await new Promise<any>((resolve, reject) => {
        this.rabbitmqRmqUserDetailsClient
          .send('rmq_user_details', extInputParams)
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

    inputParams.get_rmq_user_details = apiResult.settings.success
      ? apiResult.data
      : [];
    inputParams = this.response.assignSingleRecord(inputParams, apiResult.data);

    if (_.isObject(apiInfo) && !_.isEmpty(apiInfo)) {
      Object.keys(apiInfo).forEach((key) => {
        const infoKey = `' . get_rmq_user_details . '_0`;
        inputParams[infoKey] = apiInfo[key];
      });
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
      message: custom.lang('ordered user details fetched successfully.'),
      fields: [],
    };
    settingFields.fields = [
      'o_user_id',
      'o_createdAt',
      'o_total_cost',
      'o_id',
      'o_user_address_id',
      'o_shipping_cost',
      'o_status',
      'oi_product_id',
      'oi_order_qty',
      'oi_price',
      'oi_orderid',
      'oi_total_price',
      'get_address',
      'land_mark',
      'address',
      'state_name',
      'countr_name',
      'pin_code',
      'first_name',
      'last_name',
      'email',
      'phone_number',
      'dial_code',
      'company_name',
      'get_product_lists',
      'product_category_id',
      'product_name',
      'product_image',
      'product_cost',
      'product_description',
      'rating',
      'status',
      'offer_type',
      'category_name',
      'product_image_name',
      'id',
      'rmq_get_user',
      'user_id',
      'profile_image',
      'first_name',
      'last_name',
      'email',
      'phone_number',
      'dial_code',
      'status',
    ];

    const outputKeys = [
      'get_user_order_details',
      'get_orders_item_details',
      'get_user_address',
      'get_rmq_product_details',
      'get_rmq_user_details',
    ];
    const outputAliases = {
      o_createdAt: 'order_createdAt',
      o_total_cost: 'order_total_cost',
      o_id: 'order_id',
      o_shipping_cost: 'shipping_cost',
      o_status: 'order_status',
      id: 'product_id',
    };
    const outputObjects = ['get_user_order_details'];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'rmq_order_detail';

    funcData.output_keys = outputKeys;
    funcData.output_alias = outputAliases;
    funcData.output_objects = outputObjects;
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
      success: 0,
      message: custom.lang('order id not found.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'rmq_order_detail',
      },
    );
  }
}
