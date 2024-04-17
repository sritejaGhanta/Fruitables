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
export class CartItemAddService extends BaseService {
  
  @Client({
    ...rabbitmqProductConfig,
    options: {
      ...rabbitmqProductConfig.options,
    }
  })
  rabbitmqRmqProductDetailsClient: ClientProxy;
  
  protected readonly log = new LoggerHandler(
    CartItemAddService.name,
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
      'check_product_is_exe',
      'update_cart',
      'insert_cart_item_data',
    ];
    this.multipleKeys = [
      'gett_product_details',
    ];
  }

  /**
   * startCartItemAdd method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startCartItemAdd(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.checkProductIsExe(inputParams);
      if (!_.isEmpty(inputParams.check_product_is_exe)) {
      inputParams = await this.updateCart(inputParams);
      } else {
      inputParams = await this.insertCartItemData(inputParams);
      }
      if (!_.isEmpty(inputParams.insert_cart_item_data) || !_.isEmpty(inputParams.update_cart)) {
      inputParams = await this.gettProductDetails(inputParams);
        outputResponse = this.cartItemAddFinishSuccess(inputParams);
      } else {
        outputResponse = this.cartItemAddFinishFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> cart_item_add >>', err);
    }
    return outputResponse;
  }
  

  /**
   * checkProductIsExe method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async checkProductIsExe(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.cartItemEntityRepo.createQueryBuilder('ci');

      queryObject.select('ci.id', 'ci_id');
      queryObject.andWhere('ci.iCartId = :iCartId', { iCartId: this.requestObj.user.cart_id });
      if (!custom.isEmpty(inputParams.product_id)) {
        queryObject.andWhere('ci.iProductId = :iProductId', { iProductId: inputParams.product_id });
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
    inputParams.check_product_is_exe = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * updateCart method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async updateCart(inputParams: any) {
    this.blockResult = {};
    try {                
      

      const queryColumns: any = {};
      queryColumns.iProductQty = () => 'iProductQty + ' + inputParams.product_qty;

      const queryObject = this.cartItemEntityRepo
        .createQueryBuilder()
        .update(CartItemEntity)
        .set(queryColumns);
      queryObject.andWhere('iCartId = :iCartId', { iCartId: this.requestObj.user.cart_id });
      if (!custom.isEmpty(inputParams.product_id)) {
        queryObject.andWhere('iProductId = :iProductId', { iProductId: inputParams.product_id });
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
    inputParams.update_cart = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * insertCartItemData method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async insertCartItemData(inputParams: any) {
    this.blockResult = {};
    try {
      const queryColumns: any = {};
      queryColumns.iCartId = this.requestObj.user.cart_id;
      if ('product_id' in inputParams) {
        queryColumns.iProductId = inputParams.product_id;
      }
      if ('product_qty' in inputParams) {
        queryColumns.iProductQty = inputParams.product_qty;
      }
      const queryObject = this.cartItemEntityRepo;
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
    inputParams.insert_cart_item_data = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * gettProductDetails method is used to process external API flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async gettProductDetails(inputParams: any) {
    
    this.blockResult = {};
    let apiResult: ResponseHandlerInterface = {};
    let apiInfo = {};
    let success;
    let message;
    
    
    const extInputParams: any = {
      id: inputParams.product_id,
    };
        
    try {
      console.log('emiting from here rabbitmq!');            
      apiResult = await new Promise<any>((resolve, reject) => {
        this.rabbitmqRmqProductDetailsClient
          .send('rmq_product_details', extInputParams)
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

    inputParams.gett_product_details = (apiResult.settings.success) ? apiResult.data : [];
    inputParams = this.response.assignSingleRecord(inputParams, apiResult.data);

    if (_.isObject(apiInfo) && !_.isEmpty(apiInfo)) {
      Object.keys(apiInfo).forEach(key => {
        const infoKey = `' . gett_product_details . '_0`;
        inputParams[infoKey] = apiInfo[key];
      });
    }

    return inputParams;
  }

  /**
   * cartItemAddFinishSuccess method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  cartItemAddFinishSuccess(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('Cart_item added successfully.'),
      fields: [],
    };
    settingFields.fields = [
      'insert_id',
      'insert_cart_item_data',
    ];

    const outputKeys = [
      'insert_cart_item_data',
    ];
    const outputObjects = [
      'insert_cart_item_data',
    ];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'cart_item_add';

    funcData.output_keys = outputKeys;
    funcData.output_objects = outputObjects;
    funcData.single_keys = this.singleKeys;
    funcData.multiple_keys = this.multipleKeys;
    return this.response.outputResponse(outputData, funcData);
  }

  /**
   * cartItemAddFinishFailure method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  cartItemAddFinishFailure(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 0,
      message: custom.lang('Something went wrong, Please try again.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'cart_item_add',
      },
    );
  }
}
