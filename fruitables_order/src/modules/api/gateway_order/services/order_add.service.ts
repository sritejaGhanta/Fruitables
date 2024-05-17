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
  rabbitmqNotificationConfig,
} from 'src/config/all-rabbitmq-core';
@Injectable()
export class OrderAddService extends BaseService {
  @Client({
    ...rabbitmqUserConfig,
    options: {
      ...rabbitmqUserConfig.options,
    },
  })
  rabbitmqRmqCartDetailsClient: ClientProxy;

  @Client({
    ...rabbitmqUserConfig,
    options: {
      ...rabbitmqUserConfig.options,
    },
  })
  rabbitmqRmqCartItemsDetailsClient: ClientProxy;

  @Client({
    ...rabbitmqUserConfig,
    options: {
      ...rabbitmqUserConfig.options,
    },
  })
  rabbitmqRmqClearCartClient: ClientProxy;

  @Client({
    ...rabbitmqNotificationConfig,
    options: {
      ...rabbitmqNotificationConfig.options,
    },
  })
  rabbitmqGatewayNotificationClient: ClientProxy;

  protected readonly log = new LoggerHandler(
    OrderAddService.name,
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
    this.singleKeys = ['prepare_order_details', 'insert_order_details'];
    this.multipleKeys = [
      'get_cart_details',
      'get_cart_items_list',
      'clear_cart',
      'send_notification',
    ];
  }

  /**
   * startOrderAdd method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startOrderAdd(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;

      inputParams = await this.getCartDetails(inputParams);
      inputParams = await this.getCartItemsList(inputParams);
      if (
        !_.isEmpty(inputParams.get_cart_items_list) &&
        !_.isEmpty(inputParams.get_cart_details)
      ) {
        inputParams = await this.prepareOrderDetails(inputParams);
        inputParams = await this.insertOrderDetails(inputParams);
        inputParams = await this.startLoop(inputParams);
        inputParams = await this.clearCart(inputParams);
        inputParams = await this.sendNotification(inputParams);
        outputResponse = this.finishSuccess(inputParams);
      } else {
        outputResponse = this.finishSuccess1(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> order_add >>', err);
    }
    return outputResponse;
  }

  /**
   * getCartDetails method is used to process external API flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getCartDetails(inputParams: any) {
    this.blockResult = {};
    let apiResult: ResponseHandlerInterface = {};
    let apiInfo = {};
    let success;
    let message;

    const extInputParams: any = {
      user_id: inputParams.user_id,
    };

    try {
      console.log('emiting from here rabbitmq!');
      apiResult = await new Promise<any>((resolve, reject) => {
        this.rabbitmqRmqCartDetailsClient
          .send('rmq_cart_details', extInputParams)
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

    inputParams.get_cart_details = apiResult.settings.success
      ? apiResult.data
      : [];
    inputParams = this.response.assignSingleRecord(inputParams, apiResult.data);

    if (_.isObject(apiInfo) && !_.isEmpty(apiInfo)) {
      Object.keys(apiInfo).forEach((key) => {
        const infoKey = `' . get_cart_details . '_0`;
        inputParams[infoKey] = apiInfo[key];
      });
    }

    return inputParams;
  }

  /**
   * getCartItemsList method is used to process external API flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getCartItemsList(inputParams: any) {
    this.blockResult = {};
    let apiResult: ResponseHandlerInterface = {};
    let apiInfo = {};
    let success;
    let message;

    const extInputParams: any = {
      cart_id: inputParams.c_id,
    };

    try {
      console.log('emiting from here rabbitmq!');
      apiResult = await new Promise<any>((resolve, reject) => {
        this.rabbitmqRmqCartItemsDetailsClient
          .send('rmq_cart_items_details', extInputParams)
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

    inputParams.get_cart_items_list = apiResult.settings.success
      ? apiResult.data
      : [];
    inputParams = this.response.assignSingleRecord(inputParams, apiResult.data);

    if (_.isObject(apiInfo) && !_.isEmpty(apiInfo)) {
      Object.keys(apiInfo).forEach((key) => {
        const infoKey = `' . get_cart_items_list . '_0`;
        inputParams[infoKey] = apiInfo[key];
      });
    }

    return inputParams;
  }

  /**
   * prepareOrderDetails method is used to process custom function.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async prepareOrderDetails(inputParams: any) {
    let formatData: any = {};
    try {
      //@ts-ignore
      const result = await this.prepareOrder(inputParams);

      formatData = this.response.assignFunctionResponse(result);
      inputParams.prepare_order_details = formatData;

      inputParams = this.response.assignSingleRecord(inputParams, formatData);
    } catch (err) {
      this.log.error(err);
    }
    return inputParams;
  }

  /**
   * insertOrderDetails method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async insertOrderDetails(inputParams: any) {
    this.blockResult = {};
    try {
      const queryColumns: any = {};
      if ('user_id' in inputParams) {
        queryColumns.iUserId = inputParams.user_id;
      }
      if ('address_id' in inputParams) {
        queryColumns.iUserAddressId = inputParams.address_id;
      }
      if ('c_products_count' in inputParams) {
        queryColumns.iItemCount = inputParams.c_products_count;
      }
      if ('total_products_const' in inputParams) {
        queryColumns.fCost = inputParams.total_products_const;
      }
      if ('shipping_const' in inputParams) {
        queryColumns.fShippingCost = inputParams.shipping_const;
      }
      if ('total_cost' in inputParams) {
        queryColumns.fTotalCost = inputParams.total_cost;
      }
      queryColumns.eStatus = 'PLACED';
      const queryObject = this.ordersEntityRepo;
      const res = await queryObject.insert(queryColumns);
      const data = {
        insert_id: res.raw.insertId,
      };

      const success = 1;
      const message = 'Record(s) inserted.';

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
    inputParams.insert_order_details = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * startLoop method is used to process loop flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async startLoop(inputParams: any) {
    inputParams.get_cart_items_list = await this.iterateStartLoop(
      inputParams.get_cart_items_list,
      inputParams,
    );
    return inputParams;
  }

  /**
   * insertOrderItems method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async insertOrderItems(inputParams: any) {
    this.blockResult = {};
    try {
      const queryColumns: any = {};
      if ('insert_id' in inputParams) {
        queryColumns.iOrderid = inputParams.insert_id;
      }
      if ('product_id' in inputParams) {
        queryColumns.iProductId = inputParams.product_id;
      }
      if ('product_qty' in inputParams) {
        queryColumns.iOrderQty = inputParams.product_qty;
      }
      if ('product_price' in inputParams) {
        queryColumns.fPrice = inputParams.product_price;
      }
      queryColumns.fTotalPrice = () =>
        '(' + inputParams.product_qty + ' * ' + inputParams.product_price + ')';
      const queryObject = this.orderItemEntityRepo;
      const res = await queryObject.insert(queryColumns);
      const data = {
        insert_id1: res.raw.insertId,
      };

      const success = 1;
      const message = 'Record(s) inserted.';

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
    inputParams.insert_order_items = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * clearCart method is used to process external API flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async clearCart(inputParams: any) {
    const extInputParams: any = {
      user_id: inputParams.user_id,
      cart_id: inputParams.c_id,
    };
    console.log('emiting from here rabbitmq no response!');
    this.rabbitmqRmqClearCartClient.emit('rmq_clear_cart', extInputParams);
    return inputParams;
  }

  /**
   * sendNotification method is used to process external API flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async sendNotification(inputParams: any) {
    const extInputParams: any = {
      id: inputParams.insert_id,
      id_type: 'order',
      notification_type: 'ORDER_ADD',
      notification_status: '',
      otp: '',
    };
    console.log('emiting from here rabbitmq no response!');
    this.rabbitmqGatewayNotificationClient.emit(
      'gateway_notification',
      extInputParams,
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
      message: custom.lang('Order placed successfully.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'order_add',
      },
    );
  }

  /**
   * finishSuccess1 method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  finishSuccess1(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 0,
      message: custom.lang('Cart or Cart Items are not foud.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'order_add',
      },
    );
  }

  /**
   * iterateStartLoop method is used to iterate loop.
   * @param array itrLoopData itrLoopData array to iterate loop.
   * @param array inputData inputData array to address original input params.
   */
  async iterateStartLoop(itrLoopData, inputData) {
    itrLoopData = _.isArray(itrLoopData) ? [...itrLoopData] : [];
    const loopDataObject = [...itrLoopData];
    const inputDataLocal = { ...inputData };
    let dictObjects = {};
    let eachLoopObj: any = {};
    let inputParams = {};

    const ini = 0;
    const end = loopDataObject.length;
    for (let i = ini; i < end; i += 1) {
      eachLoopObj = inputDataLocal;

      delete eachLoopObj.get_cart_items_list;
      if (_.isObject(loopDataObject[i])) {
        eachLoopObj = { ...inputDataLocal, ...loopDataObject[i] };
      } else {
        eachLoopObj.get_cart_items_list = loopDataObject[i];
        loopDataObject[i] = [];
        loopDataObject[i].get_cart_items_list = eachLoopObj.get_cart_items_list;
      }

      eachLoopObj.i = i;
      inputParams = { ...eachLoopObj };

      inputParams = await this.insertOrderItems(inputParams);

      itrLoopData[i] = this.response.filterLoopParams(
        inputParams,
        loopDataObject[i],
        eachLoopObj,
      );
    }
    return itrLoopData;
  }
}
