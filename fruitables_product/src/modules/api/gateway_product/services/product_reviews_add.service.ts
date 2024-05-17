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

import { ProductReviewsEntity } from 'src/entities/product-reviews.entity';
import { ProductsEntity } from 'src/entities/products.entity';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class ProductReviewsAddService extends BaseService {
  protected readonly log = new LoggerHandler(
    ProductReviewsAddService.name,
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
  @InjectRepository(ProductReviewsEntity)
  protected productReviewsEntityRepo: Repository<ProductReviewsEntity>;
  @InjectRepository(ProductsEntity)
  protected productsEntityRepo: Repository<ProductsEntity>;

  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.singleKeys = [
      'insert_product_reviews_data',
      'get_overall_rating',
      'update_overall_ratting',
    ];
  }

  /**
   * startProductReviewsAdd method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startProductReviewsAdd(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;

      inputParams = await this.insertProductReviewsData(inputParams);
      if (!_.isEmpty(inputParams.insert_product_reviews_data)) {
        inputParams = await this.getOverallRating(inputParams);
        inputParams = await this.updateOverallRatting(inputParams);
        outputResponse = this.productReviewsAddFinishSuccess(inputParams);
      } else {
        outputResponse = this.productReviewsAddFinishFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> product_reviews_add >>', err);
    }
    return outputResponse;
  }

  /**
   * insertProductReviewsData method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async insertProductReviewsData(inputParams: any) {
    this.blockResult = {};
    try {
      const queryColumns: any = {};
      if ('product_id' in inputParams) {
        queryColumns.iProductId = inputParams.product_id;
      }
      if ('user_id' in inputParams) {
        queryColumns.iUserId = inputParams.user_id;
      }
      if ('review' in inputParams) {
        queryColumns.tReview = inputParams.review;
      }
      if ('rating' in inputParams) {
        queryColumns.fRating = inputParams.rating;
      }
      const queryObject = this.productReviewsEntityRepo;
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
    inputParams.insert_product_reviews_data = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * getOverallRating method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getOverallRating(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.productReviewsEntityRepo.createQueryBuilder(
        'pr',
      );

      queryObject.select('AVG(pr.fRating)', 'overall_rating');
      if (!custom.isEmpty(inputParams.product_id)) {
        queryObject.andWhere('pr.iProductId = :iProductId', {
          iProductId: inputParams.product_id,
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
    inputParams.get_overall_rating = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * updateOverallRatting method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async updateOverallRatting(inputParams: any) {
    this.blockResult = {};
    try {
      const queryColumns: any = {};
      if ('overall_rating' in inputParams) {
        queryColumns.fRating = inputParams.overall_rating;
      }

      const queryObject = this.productsEntityRepo
        .createQueryBuilder()
        .update(ProductsEntity)
        .set(queryColumns);
      if (!custom.isEmpty(inputParams.product_id)) {
        queryObject.andWhere('id = :id', { id: inputParams.product_id });
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
    inputParams.update_overall_ratting = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * productReviewsAddFinishSuccess method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  productReviewsAddFinishSuccess(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('Product review added successfully.'),
      fields: [],
    };
    settingFields.fields = ['insert_id'];

    const outputKeys = ['insert_product_reviews_data'];
    const outputObjects = ['insert_product_reviews_data'];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'product_reviews_add';

    funcData.output_keys = outputKeys;
    funcData.output_objects = outputObjects;
    funcData.single_keys = this.singleKeys;
    return this.response.outputResponse(outputData, funcData);
  }

  /**
   * productReviewsAddFinishFailure method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  productReviewsAddFinishFailure(inputParams: any) {
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
        name: 'product_reviews_add',
      },
    );
  }
}
