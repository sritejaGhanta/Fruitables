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
export class CartItemDeleteService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    CartItemDeleteService.name,
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
      'delete_cart_item_data',
    ];
  }

  /**
   * startCartItemDelete method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startCartItemDelete(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.deleteCartItemData(inputParams);
      if (!_.isEmpty(inputParams.delete_cart_item_data)) {
        outputResponse = this.cartItemDeleteFinishSuccess(inputParams);
      } else {
        outputResponse = this.cartItemDeleteFinishFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> cart_item_delete >>', err);
    }
    return outputResponse;
  }
  

  /**
   * deleteCartItemData method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async deleteCartItemData(inputParams: any) {
    this.blockResult = {};
    try {      
                    
      const queryObject = this.cartItemEntityRepo
        .createQueryBuilder()
        .delete();
      if (!custom.isEmpty(inputParams.id)) {
        queryObject.andWhere('id = :id', { id: inputParams.id });
      }
      const res = await queryObject.execute();
      const data = {
        affected_rows: res.affected,
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
    inputParams.delete_cart_item_data = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * cartItemDeleteFinishSuccess method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  cartItemDeleteFinishSuccess(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('Cart_item record deleted successfully.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'cart_item_delete',
      },
    );
  }

  /**
   * cartItemDeleteFinishFailure method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  cartItemDeleteFinishFailure(inputParams: any) {
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
        name: 'cart_item_delete',
      },
    );
  }
}
