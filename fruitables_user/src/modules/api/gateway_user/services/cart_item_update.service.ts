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
import { CartEntity } from 'src/entities/cart.entity';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class CartItemUpdateService extends BaseService {
  protected readonly log = new LoggerHandler(
    CartItemUpdateService.name,
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
  @InjectRepository(CartEntity)
  protected cartEntityRepo: Repository<CartEntity>;

  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.singleKeys = ['update_cart_item_data', 'update_cart_1'];
  }

  /**
   * startCartItemUpdate method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startCartItemUpdate(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;

      inputParams = await this.updateCartItemData(inputParams);
      if (!_.isEmpty(inputParams.update_cart_item_data)) {
        inputParams = await this.updateCart1(inputParams);
        outputResponse = this.cartItemUpdateFinishSuccess(inputParams);
      } else {
        outputResponse = this.cartItemUpdateFinishFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> cart_item_update >>', err);
    }
    return outputResponse;
  }

  /**
   * updateCartItemData method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async updateCartItemData(inputParams: any) {
    this.blockResult = {};
    try {
      const queryColumns: any = {};
      queryColumns.iProductQty = () =>
        '(iProductQty + ' + inputParams.change_quantity + ')';

      const queryObject = this.cartItemEntityRepo
        .createQueryBuilder()
        .update(CartItemEntity)
        .set(queryColumns);
      queryObject.andWhere('iCartId = :iCartId', {
        iCartId: this.requestObj.user.cart_id,
      });
      if (!custom.isEmpty(inputParams.id)) {
        queryObject.andWhere('iProductId = :iProductId', {
          iProductId: inputParams.id,
        });
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
    inputParams.update_cart_item_data = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * updateCart1 method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async updateCart1(inputParams: any) {
    this.blockResult = {};
    try {
      const queryColumns: any = {};
      queryColumns.iProductsCount = () =>
        '(iProductsCount + ' + inputParams.change_quantity + ')';

      const queryObject = this.cartEntityRepo
        .createQueryBuilder()
        .update(CartEntity)
        .set(queryColumns);
      queryObject.andWhere('id = :id', { id: this.requestObj.user.cart_id });
      queryObject.andWhere('iUserId = :iUserId', {
        iUserId: this.requestObj.user.user_id,
      });
      const res = await queryObject.execute();
      const data = {
        affected_rows1: res.affected,
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
    inputParams.update_cart_1 = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * cartItemUpdateFinishSuccess method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  cartItemUpdateFinishSuccess(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('Cart_item record updated successfully.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'cart_item_update',
      },
    );
  }

  /**
   * cartItemUpdateFinishFailure method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  cartItemUpdateFinishFailure(inputParams: any) {
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
        name: 'cart_item_update',
      },
    );
  }
}
