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

import { CartItemEntity } from 'src/entities/cart-item.entity';
import { BaseService } from 'src/services/base.service';

import { rabbitmqProductConfig } from 'src/config/all-rabbitmq-core';
@Injectable()
export class RmqGetCartItemsDetailsService extends BaseService {
  
  @Client({
    ...rabbitmqProductConfig,
    options: {
      ...rabbitmqProductConfig.options,
    }
  })
  rabbitmqRmqGetProductListClient: ClientProxy;
  
  protected readonly log = new LoggerHandler(
    RmqGetCartItemsDetailsService.name,
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
    @InjectRepository(CartItemEntity)
  protected cartItemEntityRepo: Repository<CartItemEntity>;
  
  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.singleKeys = [
      'custom_function',
      'prepare_output',
    ];
    this.multipleKeys = [
      'get_cart_item_list_v1',
      'call_product_list',
    ];
  }

  /**
   * startRmqGetCartItemsDetails method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startRmqGetCartItemsDetails(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.getCartItemListV1(inputParams);
      if (!_.isEmpty(inputParams.get_cart_item_list_v1)) {
      inputParams = await this.customFunction(inputParams);
      inputParams = await this.callProductList(inputParams);
      inputParams = await this.prepareOutput(inputParams);
        outputResponse = this.finishSuccess(inputParams);
      } else {
        outputResponse = this.finishFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> rmq_get_cart_items_details >>', err);
    }
    return outputResponse;
  }
  

  /**
   * getCartItemListV1 method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getCartItemListV1(inputParams: any) {
    this.blockResult = {};
    try {
      const extraConfig = {
        table_name: 'cart_item',
        table_alias: 'ci',
        primary_key: 'id',
        request_obj: this.requestObj,
      };
      const queryObject = this.cartItemEntityRepo.createQueryBuilder('ci');

      queryObject.select('ci.id', 'cart_item_id');
      queryObject.addSelect('ci.iCartId', 'ci_cart_id');
      queryObject.addSelect('ci.iProductId', 'ci_product_id');
      queryObject.addSelect('ci.iProductQty', 'ci_product_qty');
      queryObject.addSelect("''", 'p_product_name');
      queryObject.addSelect("''", 'product_price');
      queryObject.addSelect("''", 'p_product_image');
      queryObject.addSelect("''", 'product_rating');
      if (!custom.isEmpty(inputParams.cart_id)) {
        queryObject.andWhere('ci.iCartId = :iCartId', { iCartId: inputParams.cart_id });
      }
      //@ts-ignore;
      this.getOrderByClause(queryObject, inputParams, extraConfig);

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
    inputParams.get_cart_item_list_v1 = this.blockResult.data;

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

    inputParams.call_product_list = (apiResult.settings.success) ? apiResult.data : [];
    inputParams = this.response.assignSingleRecord(inputParams, apiResult.data);

    if (_.isObject(apiInfo) && !_.isEmpty(apiInfo)) {
      Object.keys(apiInfo).forEach(key => {
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
      message: custom.lang('data found.'),
      fields: [],
    };
    settingFields.fields = [
      'cart_item_id',
      'ci_cart_id',
      'ci_product_id',
      'ci_product_qty',
      'p_product_name',
      'product_price',
      'p_product_image',
      'product_rating',
    ];

    const outputKeys = [
      'get_cart_item_list_v1',
    ];
    const outputAliases = {
      ci_cart_id: 'cart_id',
      ci_product_id: 'product_id',
      ci_product_qty: 'product_qty',
      p_product_name: 'product_name',
      p_product_image: 'product_image',
    };

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'rmq_get_cart_items_details';

    funcData.output_keys = outputKeys;
    funcData.output_alias = outputAliases;
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
      message: custom.lang('List not found'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'rmq_get_cart_items_details',
      },
    );
  }
}
