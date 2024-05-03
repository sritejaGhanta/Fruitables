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
export class ProductsAutocompleteService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    ProductsAutocompleteService.name,
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
    this.multipleKeys = [
      'get_products_results',
    ];
  }

  /**
   * startProductsAutocomplete method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startProductsAutocomplete(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.getProductsResults(inputParams);
      if (!_.isEmpty(inputParams.get_products_results)) {
        outputResponse = this.productsAutocompleteFinishSuccess(inputParams);
      } else {
        outputResponse = this.productsAutocompleteFinishFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> products_autocomplete >>', err);
    }
    return outputResponse;
  }
  

  /**
   * getProductsResults method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getProductsResults(inputParams: any) {
    this.blockResult = {};
    try {
      let pageIndex = 1;
      if ('page' in inputParams) {
        pageIndex = Number(inputParams.page);
      } else if ('page_index' in inputParams) {
        pageIndex = Number(inputParams.page_index);
      }
      pageIndex = pageIndex > 0 ? pageIndex : 1;
      const recLimit = 500;
      const startIdx = custom.getStartIndex(pageIndex, recLimit);

      let queryObject = this.productsEntityRepo.createQueryBuilder('p');

      queryObject.leftJoin(ProductCategoryEntity, 'pc', 'p.iProductCategoryId = pc.id');
      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.andWhere('p.vProductName LIKE :vProductName', { vProductName: `${inputParams.keyword}%` });
      }
      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.andWhere('p.fProductCost = :fProductCost', { fProductCost: inputParams.keyword });
      }
      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.andWhere('p.eStatus = :eStatus', { eStatus: inputParams.keyword });
      }

      const totalCount = await queryObject.getCount();
      this.settingsParams = custom.getPagination(totalCount, pageIndex, recLimit);
      if (!totalCount) {
        throw new Error('No records found.');
      }

      queryObject = this.productsEntityRepo.createQueryBuilder('p');

      queryObject.leftJoin(ProductCategoryEntity, 'pc', 'p.iProductCategoryId = pc.id');
      queryObject.select('p.id', 'p_id');
      queryObject.addSelect('p.vProductName', 'p_product_name');
      queryObject.addSelect('p.fProductCost', 'p_product_cost');
      queryObject.addSelect('pc.vCategoryName', 'pc_category_name');
      queryObject.addSelect('p.vProductImage', 'p_product_image');
      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.andWhere('p.vProductName LIKE :vProductName', { vProductName: `${inputParams.keyword}%` });
      }
      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.andWhere('p.fProductCost = :fProductCost', { fProductCost: inputParams.keyword });
      }
      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.andWhere('p.eStatus = :eStatus', { eStatus: inputParams.keyword });
      }
      queryObject.addOrderBy('p.vProductName', 'ASC');
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
          fileConfig.extensions = await this.general.getConfigItem('allowed_extensions');
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
      this.blockResult.success = 0;
      this.blockResult.message = err;
      this.blockResult.data = [];
    }
    inputParams.get_products_results = this.blockResult.data;

    return inputParams;
  }

  /**
   * productsAutocompleteFinishSuccess method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  productsAutocompleteFinishSuccess(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('Products results found.'),
      fields: [],
    };
    settingFields.fields = [
      'p_id',
      'p_product_name',
      'p_product_cost',
      'pc_category_name',
      'p_product_image',
    ];

    const outputKeys = [
      'get_products_results',
    ];
    const outputAliases = {
      p_id: 'id',
      p_product_name: 'product_name',
      p_product_cost: 'product_cost',
      pc_category_name: 'category_name',
      p_product_image: 'product_image',
    };

    const outputData: any = {};
    outputData.settings = { ...settingFields, ...this.settingsParams };
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'products_autocomplete';

    funcData.output_keys = outputKeys;
    funcData.output_alias = outputAliases;
    funcData.multiple_keys = this.multipleKeys;
    return this.response.outputResponse(outputData, funcData);
  }

  /**
   * productsAutocompleteFinishFailure method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  productsAutocompleteFinishFailure(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('products results not found.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'products_autocomplete',
      },
    );
  }
}
