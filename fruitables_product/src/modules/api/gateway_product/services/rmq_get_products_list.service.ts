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
export class RmqGetProductsListService extends BaseService {
  protected readonly log = new LoggerHandler(
    RmqGetProductsListService.name,
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
    this.multipleKeys = ['get_product_lists'];
  }

  /**
   * startRmqGetProductsList method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startRmqGetProductsList(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;

      inputParams = await this.getProductLists(inputParams);
      if (!_.isEmpty(inputParams.get_product_lists)) {
        outputResponse = this.productsFinishSuccess1(inputParams);
      } else {
        outputResponse = this.productsFinishSuccess(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> rmq_get_products_list >>', err);
    }
    return outputResponse;
  }

  /**
   * getProductLists method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getProductLists(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.productsEntityRepo.createQueryBuilder('p');

      queryObject.leftJoin(
        ProductCategoryEntity,
        'pc',
        'p.iProductCategoryId = pc.id',
      );
      queryObject.select('p.iProductCategoryId', 'product_category_id');
      queryObject.addSelect('p.vProductName', 'product_name');
      queryObject.addSelect('p.vProductImage', 'product_image');
      queryObject.addSelect('p.fProductCost', 'product_cost');
      queryObject.addSelect('p.vProductDescription', 'product_description');
      queryObject.addSelect('p.fRating', 'rating');
      queryObject.addSelect('p.eStatus', 'status');
      queryObject.addSelect('p.eOfferType', 'offer_type');
      queryObject.addSelect('pc.vCategoryName', 'category_name');
      queryObject.addSelect('p.vProductImage', 'product_image_name');
      queryObject.addSelect('p.id', 'id');

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
    inputParams.get_product_lists = this.blockResult.data;

    return inputParams;
  }

  /**
   * productsFinishSuccess1 method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  productsFinishSuccess1(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('data found.'),
      fields: [],
    };
    settingFields.fields = [
      'product_category_id',
      'product_name',
      'product_image',
      'product_cost',
      'product_description',
      'rating',
      'status',
      'offer_type',
      'category_name',
      'product_image_name',
      'id',
    ];

    const outputKeys = ['get_product_lists'];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'rmq_get_products_list';

    funcData.output_keys = outputKeys;
    funcData.multiple_keys = this.multipleKeys;
    return this.response.outputResponse(outputData, funcData);
  }

  /**
   * productsFinishSuccess method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  productsFinishSuccess(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 0,
      message: custom.lang('data not found.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'rmq_get_products_list',
      },
    );
  }
}
