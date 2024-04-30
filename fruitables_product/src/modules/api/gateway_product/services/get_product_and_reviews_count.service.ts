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

import { ProductsEntity } from 'src/entities/products.entity';
import { ProductReviewsEntity } from 'src/entities/product-reviews.entity';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class GetProductAndReviewsCountService extends BaseService {
  protected readonly log = new LoggerHandler(
    GetProductAndReviewsCountService.name,
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
  @InjectRepository(ProductsEntity)
  protected productsEntityRepo: Repository<ProductsEntity>;
  @InjectRepository(ProductReviewsEntity)
  protected productReviewsEntityRepo: Repository<ProductReviewsEntity>;

  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.singleKeys = ['products_count', 'product_reviews_count'];
  }

  /**
   * startGetProductAndReviewsCount method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startGetProductAndReviewsCount(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;

      inputParams = await this.productsCount(inputParams);
      inputParams = await this.productReviewsCount(inputParams);
      outputResponse = this.productsFinishSuccess(inputParams);
    } catch (err) {
      this.log.error('API Error >> get_product_and_reviews_count >>', err);
    }
    return outputResponse;
  }

  /**
   * productsCount method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async productsCount(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.productsEntityRepo.createQueryBuilder('p');

      queryObject.select('count(*)', 'total_products_count');

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
    inputParams.products_count = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * productReviewsCount method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async productReviewsCount(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.productReviewsEntityRepo.createQueryBuilder(
        'pr',
      );

      queryObject.select('count(*)', 'custom_field_2');
      queryObject.addGroupBy('pr.iUserId');

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
    inputParams.product_reviews_count = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * productsFinishSuccess method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  productsFinishSuccess(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('data found.'),
      fields: [],
    };
    settingFields.fields = ['total_products_count', 'custom_field_2'];

    const outputKeys = ['products_count', 'product_reviews_count'];
    const outputObjects = ['products_count', 'product_reviews_count'];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'get_product_and_reviews_count';

    funcData.output_keys = outputKeys;
    funcData.output_objects = outputObjects;
    funcData.single_keys = this.singleKeys;
    return this.response.outputResponse(outputData, funcData);
  }
}
