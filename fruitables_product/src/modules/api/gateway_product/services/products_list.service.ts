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
import { FileFetchDto } from 'src/common/dto/amazon.dto';

import { ResponseLibrary } from 'src/utilities/response-library';
import { CitGeneralLibrary } from 'src/utilities/cit-general-library';

import { ProductsEntity } from 'src/entities/products.entity';
import { ProductCategoryEntity } from 'src/entities/product-category.entity';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class ProductsListService extends BaseService {
  protected readonly log = new LoggerHandler(
    ProductsListService.name,
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
  @InjectRepository(ProductsEntity)
  protected productsEntityRepo: Repository<ProductsEntity>;

  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.multipleKeys = ['get_products_list', 'reviewproductslist'];
  }

  /**
   * startProductsList method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startProductsList(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;

      inputParams = await this.getProductsList(inputParams);
      if (!_.isEmpty(inputParams.get_products_list)) {
        if (inputParams.review_products === 'yes') {
          inputParams = await this.reviewproductslist(inputParams);
          outputResponse = this.finishProductsListSuccess(inputParams);
        } else {
          outputResponse = this.finishSuccess(inputParams);
        }
      } else {
        outputResponse = this.finishProductsListFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> products_list >>', err);
    }
    return outputResponse;
  }

  /**
   * getProductsList method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getProductsList(inputParams: any) {
    this.blockResult = {};
    try {
      const extraConfig = {
        table_name: 'products',
        table_alias: 'p',
        primary_key: 'id',
        request_obj: this.requestObj,
      };
      let pageIndex = 1;
      if ('page' in inputParams) {
        pageIndex = Number(inputParams.page);
      } else if ('page_index' in inputParams) {
        pageIndex = Number(inputParams.page_index);
      }
      pageIndex = pageIndex > 0 ? pageIndex : 1;
      const recLimit = Number(inputParams.limit);
      const startIdx = custom.getStartIndex(pageIndex, recLimit);

      let queryObject = this.productsEntityRepo.createQueryBuilder('p');

      queryObject.leftJoin(
        ProductCategoryEntity,
        'pc',
        'p.iProductCategoryId = pc.id',
      );
      // @ts-ignore
      this.getWhereClause(queryObject, inputParams, extraConfig);

      const totalCount = await queryObject.getCount();
      this.settingsParams = custom.getPagination(
        totalCount,
        pageIndex,
        recLimit,
      );
      if (!totalCount) {
        throw new Error('No records found.');
      }

      queryObject = this.productsEntityRepo.createQueryBuilder('p');

      queryObject.leftJoin(
        ProductCategoryEntity,
        'pc',
        'p.iProductCategoryId = pc.id',
      );
      queryObject.select('p.id', 'p_id');
      queryObject.addSelect('p.vProductName', 'p_product_name');
      queryObject.addSelect('p.vProductImage', 'p_product_image');
      queryObject.addSelect('p.fProductCost', 'p_product_cost');
      queryObject.addSelect('p.vProductDescription', 'p_product_description');
      queryObject.addSelect('p.fRating', 'p_rating');
      queryObject.addSelect('p.iProductCategoryId', 'p_product_category_id');
      queryObject.addSelect('p.eStatus', 'p_status');
      queryObject.addSelect('p.eOfferType', 'p_offer_type');
      queryObject.addSelect('pc.vCategoryName', 'category_name');
      queryObject.addSelect('p.vProductImage', 'product_image_name');
      //@ts-ignore;
      this.getWhereClause(queryObject, inputParams, extraConfig);
      //@ts-ignore;
      this.getOrderByClause(queryObject, inputParams, extraConfig);
      queryObject.offset(startIdx);
      queryObject.limit(recLimit);

      const data = await queryObject.getRawMany();

      if (!_.isArray(data) || _.isEmpty(data)) {
        throw new Error('No records found.');
      }

      let fileConfig: FileFetchDto;
      let val;
      if (_.isArray(data) && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          val = row.p_product_image;
          fileConfig = {};
          fileConfig.source = 'local';
          fileConfig.path = 'product_images';
          fileConfig.image_name = val;
          fileConfig.extensions = await this.general.getConfigItem(
            'allowed_extensions',
          );
          fileConfig.no_img_req = false;
          val = await this.general.getFile(fileConfig, inputParams);
          data[i].p_product_image = val;
        }
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
      console.log(err);
      this.blockResult.success = 0;
      this.blockResult.message = err;
      this.blockResult.data = [];
    }
    inputParams.get_products_list = this.blockResult.data;

    return inputParams;
  }

  /**
   * reviewproductslist method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async reviewproductslist(inputParams: any) {
    this.blockResult = {};
    try {
      const extraConfig = {
        table_name: 'products',
        table_alias: 'p',
        primary_key: 'id',
        request_obj: this.requestObj,
      };
      const queryObject = this.productsEntityRepo.createQueryBuilder('p');

      queryObject.leftJoin(
        ProductCategoryEntity,
        'pc',
        'p.iProductCategoryId = pc.id',
      );
      queryObject.select('p.iProductCategoryId', 'p_product_category_id_1');
      queryObject.addSelect('p.vProductName', 'p_product_name_1');
      queryObject.addSelect('p.vProductImage', 'p_product_image_1');
      queryObject.addSelect('p.fProductCost', 'p_product_cost_1');
      queryObject.addSelect('p.vProductDescription', 'p_product_description_1');
      queryObject.addSelect('p.fRating', 'p_rating_1');
      queryObject.addSelect('p.id', 'p_id_1');
      queryObject.addSelect('p.eOfferType', 'p_offer_type_1');
      queryObject.addSelect('p.eStatus', 'p_status_1');
      queryObject.addSelect('pc.vCategoryName', 'pc_category_name');
      queryObject.addSelect('p.vProductImage', 'product_image_name_1');
      queryObject.limit(5);

      const data = await queryObject.getRawMany();
      if (!_.isArray(data) || _.isEmpty(data)) {
        throw new Error('No records found.');
      }

      let fileConfig: FileFetchDto;
      let val;
      if (_.isArray(data) && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          val = row.p_product_image_1;
          fileConfig = {};
          fileConfig.source = 'local';
          fileConfig.path = 'product_images';
          fileConfig.image_name = val;
          fileConfig.extensions = await this.general.getConfigItem(
            'allowed_extensions',
          );
          fileConfig.no_img_req = false;
          val = await this.general.getFile(fileConfig, inputParams);
          data[i].p_product_image_1 = val;
        }
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
    inputParams.reviewproductslist = this.blockResult.data;

    return inputParams;
  }

  /**
   * finishProductsListSuccess method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  finishProductsListSuccess(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('Products list found.'),
      fields: [],
    };
    settingFields.fields = [
      'p_id',
      'p_product_name',
      'p_product_image',
      'p_product_cost',
      'p_product_description',
      'p_rating',
      'p_product_category_id',
      'p_status',
      'p_offer_type',
      'category_name',
      'product_image_name',
      'p_product_category_id_1',
      'p_product_name_1',
      'p_product_image_1',
      'p_product_cost_1',
      'p_product_description_1',
      'p_rating_1',
      'p_id_1',
      'p_offer_type_1',
      'p_status_1',
      'pc_category_name',
      'product_image_name_1',
    ];

    const outputKeys = ['get_products_list', 'reviewproductslist'];
    const outputAliases = {
      p_id: 'id',
      p_product_name: 'product_name',
      p_product_image: 'product_image',
      p_product_cost: 'product_cost',
      p_product_description: 'product_description',
      p_rating: 'rating',
      p_product_category_id: 'product_category_id',
      p_status: 'status',
      p_offer_type: 'offer_type',
      p_product_category_id_1: 'product_category_id',
      p_product_name_1: 'product_name',
      p_product_image_1: 'product_image',
      p_product_cost_1: 'product_cost',
      p_product_description_1: 'product_description',
      p_rating_1: 'rating',
      p_id_1: 'id',
      p_offer_type_1: 'offer_type',
      p_status_1: 'status',
      pc_category_name: 'category_name',
      product_image_name_1: 'product_image_name',
    };

    const outputData: any = {};
    outputData.settings = { ...settingFields, ...this.settingsParams };
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'products_list';

    funcData.output_keys = outputKeys;
    funcData.output_alias = outputAliases;
    funcData.multiple_keys = this.multipleKeys;
    return this.response.outputResponse(outputData, funcData);
  }

  /**
   * finishSuccess method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  finishSuccess(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('Products list found.'),
      fields: [],
    };
    settingFields.fields = [
      'p_id',
      'p_product_name',
      'p_product_image',
      'p_product_cost',
      'p_product_description',
      'p_rating',
      'p_product_category_id',
      'p_status',
      'p_offer_type',
      'category_name',
      'product_image_name',
    ];

    const outputKeys = ['get_products_list'];
    const outputAliases = {
      p_id: 'id',
      p_product_name: 'product_name',
      p_product_image: 'product_image',
      p_product_cost: 'product_cost',
      p_product_description: 'product_description',
      p_rating: 'rating',
      p_product_category_id: 'product_category_id',
      p_status: 'status',
      p_offer_type: 'offer_type',
    };

    const outputData: any = {};
    outputData.settings = { ...settingFields, ...this.settingsParams };
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'products_list';

    funcData.output_keys = outputKeys;
    funcData.output_alias = outputAliases;
    funcData.multiple_keys = this.multipleKeys;
    return this.response.outputResponse(outputData, funcData);
  }

  /**
   * finishProductsListFailure method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  finishProductsListFailure(inputParams: any) {
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
        name: 'products_list',
      },
    );
  }
}
