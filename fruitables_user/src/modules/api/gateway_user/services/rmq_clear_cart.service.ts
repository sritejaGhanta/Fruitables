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

import { CartEntity } from 'src/entities/cart.entity';
import { CartItemEntity } from 'src/entities/cart-item.entity';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class RmqClearCartService extends BaseService {
  protected readonly log = new LoggerHandler(
    RmqClearCartService.name,
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
  @InjectRepository(CartEntity)
  protected cartEntityRepo: Repository<CartEntity>;
  @InjectRepository(CartItemEntity)
  protected cartItemEntityRepo: Repository<CartItemEntity>;

  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.singleKeys = ['clear_cart', 'clear_cart_items'];
  }

  /**
   * startRmqClearCart method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startRmqClearCart(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;

      inputParams = await this.clearCart(inputParams);
      inputParams = await this.clearCartItems(inputParams);
      outputResponse = this.cartFinishSuccess(inputParams);
    } catch (err) {
      this.log.error('API Error >> rmq_clear_cart >>', err);
    }
    return outputResponse;
  }

  /**
   * clearCart method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async clearCart(inputParams: any) {
    this.blockResult = {};
    try {
      const queryColumns: any = {};
      queryColumns.iProductsCount = () => '0';
      queryColumns.fCost = () => '0';
      queryColumns.fShippingCost = () => '0';
      queryColumns.fTotalCost = () => '0';

      const queryObject = this.cartEntityRepo
        .createQueryBuilder()
        .update(CartEntity)
        .set(queryColumns);
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
    inputParams.clear_cart = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * clearCartItems method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async clearCartItems(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.cartItemEntityRepo.createQueryBuilder().delete();
      const res = await queryObject.execute();
      const data = {
        affected_rows1: res.affected,
      };

      const success = 1;
      const message = 'Record(s) deleted.';

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
    inputParams.clear_cart_items = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * cartFinishSuccess method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  cartFinishSuccess(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('Items cleared successfully.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'rmq_clear_cart',
      },
    );
  }
}
