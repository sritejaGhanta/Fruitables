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


import { CartItemEntity } from 'src/entities/cart-item.entity';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class CartDetailsService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    CartDetailsService.name,
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
    @InjectRepository(CartItemEntity)
  protected cartItemEntityRepo: Repository<CartItemEntity>;
  
  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.singleKeys = [
      'get_cart_item_details',
    ];
  }

  /**
   * startCartDetails method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startCartDetails(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.getCartItemDetails(inputParams);
      if (!_.isEmpty(inputParams.get_cart_item_details)) {
        outputResponse = this.cartItemDetailsFinishSuccess(inputParams);
      } else {
        outputResponse = this.cartItemDetailsFinishFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> cart_details >>', err);
    }
    return outputResponse;
  }
  

  /**
   * getCartItemDetails method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getCartItemDetails(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.cartItemEntityRepo.createQueryBuilder('ci');

      queryObject.select('ci.id', 'ci_id');
      queryObject.addSelect('ci.iCartId', 'ci_cart_id');
      queryObject.addSelect('ci.iProductId', 'ci_product_id');
      queryObject.addSelect('ci.iProductQty', 'ci_product_qty');
      if (!custom.isEmpty(inputParams.id)) {
        queryObject.andWhere('ci.id = :id', { id: inputParams.id });
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
    inputParams.get_cart_item_details = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * cartItemDetailsFinishSuccess method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  cartItemDetailsFinishSuccess(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('Cart_item details found.'),
      fields: [],
    };
    settingFields.fields = [
      'ci_id',
      'ci_cart_id',
      'ci_product_id',
      'ci_product_qty',
    ];

    const outputKeys = [
      'get_cart_item_details',
    ];
    const outputAliases = {
      ci_id: 'id',
      ci_cart_id: 'cart_id',
      ci_product_id: 'product_id',
      ci_product_qty: 'product_qty',
    };
    const outputObjects = [
      'get_cart_item_details',
    ];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'cart_details';

    funcData.output_keys = outputKeys;
    funcData.output_alias = outputAliases;
    funcData.output_objects = outputObjects;
    funcData.single_keys = this.singleKeys;
    return this.response.outputResponse(outputData, funcData);
  }

  /**
   * cartItemDetailsFinishFailure method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  cartItemDetailsFinishFailure(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 0,
      message: custom.lang('cart_item details not found.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'cart_details',
      },
    );
  }
}
