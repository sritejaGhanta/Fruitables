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
export class ProductReviewsUpdateService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    ProductReviewsUpdateService.name,
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
      'update_product_reviews_data',
      'overall_rating_get',
      'overall_rating_update',
    ];
  }

  /**
   * startProductReviewsUpdate method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startProductReviewsUpdate(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.updateProductReviewsData(inputParams);
      if (!_.isEmpty(inputParams.update_product_reviews_data)) {
      inputParams = await this.overallRatingGet(inputParams);
      inputParams = await this.overallRatingUpdate(inputParams);
        outputResponse = this.productReviewsUpdateFinishSuccess(inputParams);
      } else {
        outputResponse = this.productReviewsUpdateFinishFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> product_reviews_update >>', err);
    }
    return outputResponse;
  }
  

  /**
   * updateProductReviewsData method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async updateProductReviewsData(inputParams: any) {
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

      const queryObject = this.productReviewsEntityRepo
        .createQueryBuilder()
        .update(ProductReviewsEntity)
        .set(queryColumns);
      if (!custom.isEmpty(inputParams.id)) {
        queryObject.andWhere('id = :id', { id: inputParams.id });
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
    inputParams.update_product_reviews_data = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * overallRatingGet method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async overallRatingGet(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.productReviewsEntityRepo.createQueryBuilder('pr');

      queryObject.select('AVG(pr.fRating)', 'overall_rating');
      if (!custom.isEmpty(inputParams.product_id)) {
        queryObject.andWhere('pr.iProductId = :iProductId', { iProductId: inputParams.product_id });
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
    inputParams.overall_rating_get = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * overallRatingUpdate method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async overallRatingUpdate(inputParams: any) {
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
    inputParams.overall_rating_update = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * productReviewsUpdateFinishSuccess method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  productReviewsUpdateFinishSuccess(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('Product reviews record updated successfully.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'product_reviews_update',
      },
    );
  }

  /**
   * productReviewsUpdateFinishFailure method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  productReviewsUpdateFinishFailure(inputParams: any) {
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
        name: 'product_reviews_update',
      },
    );
  }
}
