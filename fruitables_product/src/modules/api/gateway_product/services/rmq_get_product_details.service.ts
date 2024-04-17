interface AuthObject {
  user: any;
}
import { Inject, Injectable, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import * as _ from 'lodash';
import * as custom from 'src/utilities/custom-helper';
import { LoggerHandler } from 'src/utilities/logger-handler';
import { BlockResultDto, SettingsParamsDto } from 'src/common/dto/common.dto';import { FileFetchDto } from 'src/common/dto/amazon.dto';

import { ResponseLibrary } from 'src/utilities/response-library';
import { CitGeneralLibrary } from 'src/utilities/cit-general-library';


import { ProductsEntity } from 'src/entities/products.entity';
import { ProductCategoryEntity } from 'src/entities/product-category.entity';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class RmqGetProductDetailsService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    RmqGetProductDetailsService.name,
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
  
  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.singleKeys = [
      'rmq_get_product',
    ];
  }

  /**
   * startRmqGetProductDetails method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startRmqGetProductDetails(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.rmqGetProduct(inputParams);
        outputResponse = this.productsFinishSuccess(inputParams);
    } catch (err) {
      this.log.error('API Error >> rmq_get_product_details >>', err);
    }
    return outputResponse;
  }
  

  /**
   * rmqGetProduct method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async rmqGetProduct(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.productsEntityRepo.createQueryBuilder('p');

      queryObject.leftJoin(ProductCategoryEntity, 'pc', 'p.id = pc.id');
      queryObject.select('p.id', 'p_id');
      queryObject.addSelect('p.iProductCategoryId', 'p_product_category_id');
      queryObject.addSelect('p.vProductName', 'p_product_name');
      queryObject.addSelect('p.vProductImage', 'p_product_image');
      queryObject.addSelect('p.fProductCost', 'p_product_cost');
      queryObject.addSelect('p.vProductDescription', 'p_product_description');
      queryObject.addSelect('p.fRating', 'p_rating');
      queryObject.addSelect('p.eStatus', 'p_status');
      queryObject.addSelect('p.eOfferType', 'p_offer_type');
      queryObject.addSelect('p.vProductImage', 'product_image_name');
      queryObject.addSelect('pc.vCategoryName', 'category_name');
      if (!custom.isEmpty(inputParams.id)) {
        queryObject.andWhere('p.id = :id', { id: inputParams.id });
      }

      const data: any = await queryObject.getRawOne();
      if (!_.isObject(data) || _.isEmpty(data)) {
        throw new Error('No records found.');
      }

      let fileConfig: FileFetchDto;
      let val;
      if (_.isObject(data) && !_.isEmpty(data)) {
        const row: any = data;
          val = row.p_product_image;
          fileConfig = {};
          fileConfig.source = 'local';
          fileConfig.path = 'product_images';
          fileConfig.image_name = val;
          fileConfig.extensions = await this.general.getConfigItem('allowed_extensions');
          fileConfig.no_img_req = false;
          val = await this.general.getFile(fileConfig, inputParams);
          data['p_product_image'] = val;
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
    inputParams.rmq_get_product = this.blockResult.data;
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
      message: custom.lang('Product Details found.'),
      fields: [],
    };
    settingFields.fields = [
      'p_id',
      'p_product_category_id',
      'p_product_name',
      'p_product_image',
      'p_product_cost',
      'p_product_description',
      'p_rating',
      'p_status',
      'p_offer_type',
      'product_image_name',
      'category_name',
    ];

    const outputKeys = [
      'rmq_get_product',
    ];
    const outputAliases = {
      p_id: 'id',
      p_product_category_id: 'product_category_id',
      p_product_name: 'product_name',
      p_product_image: 'product_image',
      p_product_cost: 'product_cost',
      p_product_description: 'product_description',
      p_rating: 'rating',
      p_status: 'status',
      p_offer_type: 'offer_type',
    };
    const outputObjects = [
      'rmq_get_product',
    ];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'rmq_get_product_details';

    funcData.output_keys = outputKeys;
    funcData.output_alias = outputAliases;
    funcData.output_objects = outputObjects;
    funcData.single_keys = this.singleKeys;
    return this.response.outputResponse(outputData, funcData);
  }
}
