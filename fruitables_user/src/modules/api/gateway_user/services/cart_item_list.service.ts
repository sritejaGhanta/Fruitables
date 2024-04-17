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
export class CartItemListService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    CartItemListService.name,
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
    @InjectRepository(CartItemEntity)
  protected cartItemEntityRepo: Repository<CartItemEntity>;
  
  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.multipleKeys = [
      'get_cart_item_list',
    ];
  }

  /**
   * startCartItemList method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startCartItemList(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.getCartItemList(inputParams);
      if (!_.isEmpty(inputParams.get_cart_item_list)) {
        outputResponse = this.finishCartItemListSuccess(inputParams);
      } else {
        outputResponse = this.finishCartItemListFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> cart_item_list >>', err);
    }
    return outputResponse;
  }
  

  /**
   * getCartItemList method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getCartItemList(inputParams: any) {
    this.blockResult = {};
    try {
      const extraConfig = {
        table_name: 'cart_item',
        table_alias: 'ci',
        primary_key: '',
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

      let queryObject = this.cartItemEntityRepo.createQueryBuilder('ci');

      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.orWhere('ci.iProductQty LIKE :iProductQty', { iProductQty: `${inputParams.keyword}%` });
      }
      //@ts-ignore;              
      this.getWhereClause(queryObject, inputParams, extraConfig);

      const totalCount = await queryObject.getCount();
      this.settingsParams = custom.getPagination(totalCount, pageIndex, recLimit);
      if (!totalCount) {
        throw new Error('No records found.');
      }

      queryObject = this.cartItemEntityRepo.createQueryBuilder('ci');

      queryObject.select('ci.id', 'ci_id');
      queryObject.addSelect('ci.iCartId', 'ci_cart_id');
      queryObject.addSelect('ci.iProductId', 'ci_product_id');
      queryObject.addSelect('ci.iProductQty', 'ci_product_qty');
      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.orWhere('ci.iProductQty LIKE :iProductQty', { iProductQty: `${inputParams.keyword}%` });
      }
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
    inputParams.get_cart_item_list = this.blockResult.data;

    return inputParams;
  }

  /**
   * finishCartItemListSuccess method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  finishCartItemListSuccess(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('Cart item list found.'),
      fields: [],
    };
    settingFields.fields = [
      'ci_id',
      'ci_cart_id',
      'ci_product_id',
      'ci_product_qty',
    ];

    const outputKeys = [
      'get_cart_item_list',
    ];
    const outputAliases = {
      ci_id: 'id',
      ci_cart_id: 'cart_id',
      ci_product_id: 'product_id',
      ci_product_qty: 'product_qty',
    };

    const outputData: any = {};
    outputData.settings = { ...settingFields, ...this.settingsParams };
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'cart_item_list';

    funcData.output_keys = outputKeys;
    funcData.output_alias = outputAliases;
    funcData.multiple_keys = this.multipleKeys;
    return this.response.outputResponse(outputData, funcData);
  }

  /**
   * finishCartItemListFailure method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  finishCartItemListFailure(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('No records found.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'cart_item_list',
      },
    );
  }
}
