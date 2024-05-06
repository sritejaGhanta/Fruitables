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
import { BaseService } from 'src/services/base.service';

@Injectable()
export class RmqGetCartDetailsService extends BaseService {
  protected readonly log = new LoggerHandler(
    RmqGetCartDetailsService.name,
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

  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.singleKeys = ['get_details_of_cart'];
  }

  /**
   * startRmqGetCartDetails method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startRmqGetCartDetails(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;

      inputParams = await this.getDetailsOfCart(inputParams);
      if (!_.isEmpty(inputParams.get_details_of_cart)) {
        outputResponse = this.cartFinishSuccess(inputParams);
      } else {
        outputResponse = this.finishFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> rmq_get_cart_details >>', err);
    }
    return outputResponse;
  }

  /**
   * getDetailsOfCart method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getDetailsOfCart(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.cartEntityRepo.createQueryBuilder('c');

      queryObject.select('c.iUserId', 'c_user_id');
      queryObject.addSelect('c.iProductsCount', 'c_products_count');
      queryObject.addSelect('c.fCost', 'c_cost');
      queryObject.addSelect('c.fShippingCost', 'c_shipping_cost');
      queryObject.addSelect('c.fTotalCost', 'c_total_cost');
      queryObject.addSelect('c.id', 'c_id');
      if (!custom.isEmpty(inputParams.user_id)) {
        queryObject.andWhere('c.iUserId = :iUserId', {
          iUserId: inputParams.user_id,
        });
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
    inputParams.get_details_of_cart = this.blockResult.data;
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
      message: custom.lang('details found'),
      fields: [],
    };
    settingFields.fields = [
      'c_user_id',
      'c_products_count',
      'c_cost',
      'c_shipping_cost',
      'c_total_cost',
      'c_id',
    ];

    const outputKeys = ['get_details_of_cart'];
    const outputObjects = ['get_details_of_cart'];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'rmq_get_cart_details';

    funcData.output_keys = outputKeys;
    funcData.output_objects = outputObjects;
    funcData.single_keys = this.singleKeys;
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
      message: custom.lang('Details not found.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'rmq_get_cart_details',
      },
    );
  }
}
