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

import { ProductReviewsEntity } from 'src/entities/product-reviews.entity';
import { BaseService } from 'src/services/base.service';

import { rabbitmqUserConfig } from 'src/config/all-rabbitmq-core';
@Injectable()
export class ProductReviewsListService extends BaseService {
  @Client({
    ...rabbitmqUserConfig,
    options: {
      ...rabbitmqUserConfig.options,
    },
  })
  rabbitmqRmqUserDetailsClient: ClientProxy;

  protected readonly log = new LoggerHandler(
    ProductReviewsListService.name,
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
  @InjectRepository(ProductReviewsEntity)
  protected productReviewsEntityRepo: Repository<ProductReviewsEntity>;

  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.multipleKeys = ['get_product_reviews_list'];
  }

  /**
   * startProductReviewsList method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startProductReviewsList(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;

      inputParams = await this.getProductReviewsList(inputParams);
      if (!_.isEmpty(inputParams.get_product_reviews_list)) {
        inputParams = await this.startLoop(inputParams);
        outputResponse = this.finishProductReviewsListSuccess(inputParams);
      } else {
        outputResponse = this.finishProductReviewsListFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> product_reviews_list >>', err);
    }
    return outputResponse;
  }

  /**
   * getProductReviewsList method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getProductReviewsList(inputParams: any) {
    this.blockResult = {};
    try {
      const extraConfig = {
        table_name: 'product_reviews',
        table_alias: 'pr',
        primary_key: 'id',
        request_obj: this.requestObj,
      };
      const queryObject = this.productReviewsEntityRepo.createQueryBuilder(
        'pr',
      );

      queryObject.select('pr.id', 'pr_id');
      queryObject.addSelect('pr.createdAt', 'pr_createdAt');
      queryObject.addSelect('pr.iProductId', 'pr_product_id');
      queryObject.addSelect('pr.iUserId', 'pr_user_id');
      queryObject.addSelect('pr.tReview', 'pr_review');
      queryObject.addSelect('pr.fRating', 'pr_rating');
      queryObject.addSelect("''", 'user_name');
      queryObject.addSelect("''", 'user_email');
      queryObject.addSelect("''", 'user_profile_image');
      if (!custom.isEmpty(inputParams.product_id)) {
        queryObject.andWhere('pr.iProductId = :iProductId', {
          iProductId: inputParams.product_id,
        });
      }
      //@ts-ignore;
      this.getWhereClause(queryObject, inputParams, extraConfig);
      queryObject.addOrderBy('pr.id', 'DESC');

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
    inputParams.get_product_reviews_list = this.blockResult.data;

    return inputParams;
  }

  /**
   * startLoop method is used to process loop flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async startLoop(inputParams: any) {
    inputParams.get_product_reviews_list = await this.iterateStartLoop(
      inputParams.get_product_reviews_list,
      inputParams,
    );
    return inputParams;
  }

  /**
   * getRmqUserDetails method is used to process external API flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getRmqUserDetails(inputParams: any) {
    this.blockResult = {};
    let apiResult: ResponseHandlerInterface = {};
    let apiInfo = {};
    let success;
    let message;

    const extInputParams: any = {
      id: inputParams.pr_user_id,
    };

    try {
      console.log('emiting from here rabbitmq!');
      apiResult = await new Promise<any>((resolve, reject) => {
        this.rabbitmqRmqUserDetailsClient
          .send('rmq_user_details', extInputParams)
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

    inputParams.get_rmq_user_details = apiResult.settings.success
      ? apiResult.data
      : [];
    inputParams = this.response.assignSingleRecord(inputParams, apiResult.data);

    if (_.isObject(apiInfo) && !_.isEmpty(apiInfo)) {
      Object.keys(apiInfo).forEach((key) => {
        const infoKey = `' . get_rmq_user_details . '_0`;
        inputParams[infoKey] = apiInfo[key];
      });
    }

    return inputParams;
  }

  /**
   * updateUserDetails method is used to process custom function.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async updateUserDetails(inputParams: any) {
    let formatData: any = {};
    try {
      //@ts-ignore
      const result = await this.updateUser(inputParams);

      formatData = this.response.assignFunctionResponse(result);
      inputParams.update_user_details = formatData;

      inputParams = this.response.assignSingleRecord(inputParams, formatData);
    } catch (err) {
      this.log.error(err);
    }
    return inputParams;
  }

  /**
   * finishProductReviewsListSuccess method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  finishProductReviewsListSuccess(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('Product reviews list found.'),
      fields: [],
    };
    settingFields.fields = [
      'pr_id',
      'pr_createdAt',
      'pr_product_id',
      'pr_user_id',
      'pr_review',
      'pr_rating',
      'user_name',
      'user_email',
      'user_profile_image',
    ];

    const outputKeys = ['get_product_reviews_list'];
    const outputAliases = {
      pr_id: 'id',
      pr_createdAt: 'createdAt',
      pr_product_id: 'product_id',
      pr_user_id: 'user_id',
      pr_review: 'review',
      pr_rating: 'rating',
    };

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'product_reviews_list';

    funcData.output_keys = outputKeys;
    funcData.output_alias = outputAliases;
    funcData.multiple_keys = this.multipleKeys;
    return this.response.outputResponse(outputData, funcData);
  }

  /**
   * finishProductReviewsListFailure method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  finishProductReviewsListFailure(inputParams: any) {
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
        name: 'product_reviews_list',
      },
    );
  }

  /**
   * iterateStartLoop method is used to iterate loop.
   * @param array itrLoopData itrLoopData array to iterate loop.
   * @param array inputData inputData array to address original input params.
   */
  async iterateStartLoop(itrLoopData, inputData) {
    itrLoopData = _.isArray(itrLoopData) ? [...itrLoopData] : [];
    const loopDataObject = [...itrLoopData];
    const inputDataLocal = { ...inputData };
    let dictObjects = {};
    let eachLoopObj: any = {};
    let inputParams = {};

    const ini = 0;
    const end = loopDataObject.length;
    for (let i = ini; i < end; i += 1) {
      eachLoopObj = inputDataLocal;

      delete eachLoopObj.get_product_reviews_list;
      if (_.isObject(loopDataObject[i])) {
        eachLoopObj = { ...inputDataLocal, ...loopDataObject[i] };
      } else {
        eachLoopObj.get_product_reviews_list = loopDataObject[i];
        loopDataObject[i] = [];
        loopDataObject[i].get_product_reviews_list =
          eachLoopObj.get_product_reviews_list;
      }

      eachLoopObj.i = i;
      inputParams = { ...eachLoopObj };

      inputParams = await this.getRmqUserDetails(inputParams);
      inputParams = await this.updateUserDetails(inputParams);

      itrLoopData[i] = this.response.filterLoopParams(
        inputParams,
        loopDataObject[i],
        eachLoopObj,
      );
    }
    return itrLoopData;
  }
}
