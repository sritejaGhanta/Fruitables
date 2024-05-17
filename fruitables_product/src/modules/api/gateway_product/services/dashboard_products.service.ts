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
export class DashboardProductsService extends BaseService {
  protected readonly log = new LoggerHandler(
    DashboardProductsService.name,
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
    this.multipleKeys = ['get_top_products'];
  }

  /**
   * startDashboardProducts method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startDashboardProducts(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;

      inputParams = await this.getTopProducts(inputParams);
      if (!_.isEmpty(inputParams.get_top_products)) {
        outputResponse = this.productsFinishSuccess(inputParams);
      } else {
        outputResponse = this.finishFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> dashboard_products >>', err);
    }
    return outputResponse;
  }

  /**
   * getTopProducts method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getTopProducts(inputParams: any) {
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
      queryObject.select('p.id', 'p_id');
      queryObject.addSelect('p.iProductCategoryId', 'p_product_category_id');
      queryObject.addSelect('p.vProductName', 'p_product_name');
      queryObject.addSelect('p.vProductImage', 'product_image');
      queryObject.addSelect('p.fProductCost', 'p_product_cost');
      queryObject.addSelect('p.vProductDescription', 'p_product_description');
      queryObject.addSelect('p.fRating', 'p_rating');
      queryObject.addSelect('p.eStatus', 'p_status');
      queryObject.addSelect('p.eOfferType', 'p_offer_type');
      queryObject.addSelect('pc.vCategoryName', 'pc_category_name');
      queryObject.addSelect('p.vProductImage', 'product_image_name');
      //@ts-ignore;
      this.applyWhere(queryObject, inputParams, extraConfig);

      const data = await queryObject.getRawMany();
      if (!_.isArray(data) || _.isEmpty(data)) {
        throw new Error('No records found.');
      }

      let fileConfig: FileFetchDto;
      let val;
      if (_.isArray(data) && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          val = row.product_image;
          fileConfig = {};
          fileConfig.source = 'local';
          fileConfig.path = 'product_images';
          fileConfig.image_name = val;
          fileConfig.extensions = await this.general.getConfigItem(
            'allowed_extensions',
          );
          fileConfig.width = 320;
          fileConfig.height = 250;
          fileConfig.resize_mode = 'fill';
          fileConfig.no_img_req = false;
          val = await this.general.getFile(fileConfig, inputParams);
          data[i].product_image = val;
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
    inputParams.get_top_products = this.blockResult.data;

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
      message: custom.lang('List found.'),
      fields: [],
    };
    settingFields.fields = [
      'p_id',
      'p_product_category_id',
      'p_product_name',
      'product_image',
      'p_product_cost',
      'p_product_description',
      'p_rating',
      'p_status',
      'p_offer_type',
      'pc_category_name',
      'product_image_name',
    ];

    const outputKeys = ['get_top_products'];
    const outputAliases = {
      p_id: 'id',
      p_product_category_id: 'product_category_id',
      p_product_name: 'product_name',
      p_product_cost: 'product_cost',
      p_product_description: 'product_description',
      p_rating: 'rating',
      p_status: 'status',
      p_offer_type: 'offer_type',
      pc_category_name: 'category_name',
    };

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'dashboard_products';

    funcData.output_keys = outputKeys;
    funcData.output_alias = outputAliases;
    funcData.multiple_keys = this.multipleKeys;
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
      success: 1,
      message: custom.lang('List not found.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'dashboard_products',
      },
    );
  }
}
