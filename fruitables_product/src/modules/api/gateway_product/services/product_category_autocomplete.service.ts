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


import { ProductCategoryEntity } from 'src/entities/product-category.entity';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class ProductCategoryAutocompleteService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    ProductCategoryAutocompleteService.name,
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
    @InjectRepository(ProductCategoryEntity)
  protected productCategoryEntityRepo: Repository<ProductCategoryEntity>;
  
  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.multipleKeys = [
      'get_product_category_results',
    ];
  }

  /**
   * startProductCategoryAutocomplete method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startProductCategoryAutocomplete(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.getProductCategoryResults(inputParams);
      if (!_.isEmpty(inputParams.get_product_category_results)) {
        outputResponse = this.productCategoryAutocompleteFinishSuccess(inputParams);
      } else {
        outputResponse = this.productCategoryAutocompleteFinishFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> product_category_autocomplete >>', err);
    }
    return outputResponse;
  }
  

  /**
   * getProductCategoryResults method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getProductCategoryResults(inputParams: any) {
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

      let queryObject = this.productCategoryEntityRepo.createQueryBuilder('pc');

      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.andWhere('pc.vCategoryName LIKE :vCategoryName', { vCategoryName: `${inputParams.keyword}%` });
      }

      const totalCount = await queryObject.getCount();
      this.settingsParams = custom.getPagination(totalCount, pageIndex, recLimit);
      if (!totalCount) {
        throw new Error('No records found.');
      }

      queryObject = this.productCategoryEntityRepo.createQueryBuilder('pc');

      queryObject.select('pc.id', 'pc_id');
      queryObject.addSelect('pc.vCategoryName', 'pc_category_name');
      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.andWhere('pc.vCategoryName LIKE :vCategoryName', { vCategoryName: `${inputParams.keyword}%` });
      }
      queryObject.addOrderBy('pc.vCategoryName', 'ASC');
      queryObject.offset(startIdx);
      queryObject.limit(recLimit);

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
    inputParams.get_product_category_results = this.blockResult.data;

    return inputParams;
  }

  /**
   * productCategoryAutocompleteFinishSuccess method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  productCategoryAutocompleteFinishSuccess(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('Product category results found.'),
      fields: [],
    };
    settingFields.fields = [
      'pc_id',
      'pc_category_name',
    ];

    const outputKeys = [
      'get_product_category_results',
    ];
    const outputAliases = {
      pc_id: 'id',
      pc_category_name: 'category_name',
    };

    const outputData: any = {};
    outputData.settings = { ...settingFields, ...this.settingsParams };
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'product_category_autocomplete';

    funcData.output_keys = outputKeys;
    funcData.output_alias = outputAliases;
    funcData.multiple_keys = this.multipleKeys;
    return this.response.outputResponse(outputData, funcData);
  }

  /**
   * productCategoryAutocompleteFinishFailure method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  productCategoryAutocompleteFinishFailure(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('product_category results not found.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'product_category_autocomplete',
      },
    );
  }
}
