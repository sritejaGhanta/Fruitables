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
export class ProductsUpdateService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    ProductsUpdateService.name,
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
      'get_product_details',
      'update_products_data',
      'get_updated_product_detail',
    ];
  }

  /**
   * startProductsUpdate method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startProductsUpdate(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.getProductDetails(inputParams);
      if (!_.isEmpty(inputParams.get_product_details)) {
      inputParams = await this.updateProductsData(inputParams);
      if (!_.isEmpty(inputParams.update_products_data)) {
      inputParams = await this.getUpdatedProductDetail(inputParams);
        outputResponse = this.productsUpdateFinishSuccess(inputParams);
      } else {
        outputResponse = this.productsUpdateFinishFailure(inputParams);
      }
      } else {
        outputResponse = this.finishFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> products_update >>', err);
    }
    return outputResponse;
  }
  

  /**
   * getProductDetails method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getProductDetails(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.productsEntityRepo.createQueryBuilder('p');

      queryObject.select('p.id', 'p_id');
      if (!custom.isEmpty(inputParams.id)) {
        queryObject.andWhere('p.id = :id', { id: inputParams.id });
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
    inputParams.get_product_details = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * updateProductsData method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async updateProductsData(inputParams: any) {
    this.blockResult = {};
    try {                
      

      const queryColumns: any = {};
      if ('product_name' in inputParams) {
        queryColumns.vProductName = inputParams.product_name;
      }
      if ('product_image' in inputParams) {
        queryColumns.vProductImage = inputParams.product_image;
      }
      if ('product_cost' in inputParams) {
        queryColumns.fProductCost = inputParams.product_cost;
      }
      if ('product_description' in inputParams) {
        queryColumns.vProductDescription = inputParams.product_description;
      }
      if ('product_category_id' in inputParams) {
        queryColumns.iProductCategoryId = inputParams.product_category_id;
      }
      if ('status' in inputParams) {
        queryColumns.eStatus = inputParams.status;
      }
      if ('offer_type' in inputParams) {
        queryColumns.eOfferType = inputParams.offer_type;
      }

      const queryObject = this.productsEntityRepo
        .createQueryBuilder()
        .update(ProductsEntity)
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
    inputParams.update_products_data = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * getUpdatedProductDetail method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getUpdatedProductDetail(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.productsEntityRepo.createQueryBuilder('p');

      queryObject.leftJoin(ProductCategoryEntity, 'pc', 'p.iProductCategoryId = pc.id');
      queryObject.select('p.id', 'p_id_1');
      queryObject.addSelect('p.iProductCategoryId', 'p_product_category_id');
      queryObject.addSelect('p.vProductName', 'p_product_name');
      queryObject.addSelect('p.vProductImage', 'p_product_image');
      queryObject.addSelect('p.fProductCost', 'p_product_cost');
      queryObject.addSelect('p.vProductDescription', 'p_product_description');
      queryObject.addSelect('p.fRating', 'p_rating');
      queryObject.addSelect('p.eStatus', 'p_status');
      queryObject.addSelect('p.eOfferType', 'p_offer_type');
      queryObject.addSelect('pc.vCategoryName', 'pc_category_name');
      queryObject.addSelect('p.vProductImage', 'product_image_name');
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
    inputParams.get_updated_product_detail = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * productsUpdateFinishSuccess method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  productsUpdateFinishSuccess(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('Products record updated successfully.'),
      fields: [],
    };
    settingFields.fields = [
      'p_id_1',
      'p_product_category_id',
      'p_product_name',
      'p_product_image',
      'p_product_cost',
      'p_product_description',
      'p_rating',
      'p_status',
      'p_offer_type',
      'pc_category_name',
      'product_image_name',
    ];

    const outputKeys = [
      'get_updated_product_detail',
    ];
    const outputAliases = {
      p_id_1: 'id',
      p_product_category_id: 'product_category_id',
      p_product_name: 'product_name',
      p_product_image: 'product_image',
      p_product_cost: 'product_cost',
      p_product_description: 'product_description',
      p_rating: 'rating',
      p_status: 'status',
      p_offer_type: 'offer_type',
      pc_category_name: 'category_name',
    };
    const outputObjects = [
      'get_updated_product_detail',
    ];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'products_update';

    funcData.output_keys = outputKeys;
    funcData.output_alias = outputAliases;
    funcData.output_objects = outputObjects;
    funcData.single_keys = this.singleKeys;
    return this.response.outputResponse(outputData, funcData);
  }

  /**
   * productsUpdateFinishFailure method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  productsUpdateFinishFailure(inputParams: any) {
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
        name: 'products_update',
      },
    );
  }

  /**
   * finishFailure method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  finishFailure(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('product not found.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'products_update',
      },
    );
  }
}
