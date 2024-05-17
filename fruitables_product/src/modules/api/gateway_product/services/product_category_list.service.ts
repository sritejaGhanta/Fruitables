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

import { ProductCategoryEntity } from 'src/entities/product-category.entity';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class ProductCategoryListService extends BaseService {
  protected readonly log = new LoggerHandler(
    ProductCategoryListService.name,
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
    this.multipleKeys = ['get_product_category_list'];
  }

  /**
   * startProductCategoryList method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startProductCategoryList(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;

      inputParams = await this.getProductCategoryList(inputParams);
      if (!_.isEmpty(inputParams.get_product_category_list)) {
        outputResponse = this.finishProductCategoryListSuccess(inputParams);
      } else {
        outputResponse = this.finishProductCategoryListFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> product_category_list >>', err);
    }
    return outputResponse;
  }

  /**
   * getProductCategoryList method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getProductCategoryList(inputParams: any) {
    this.blockResult = {};
    try {
      const extraConfig = {
        table_name: 'product_category',
        table_alias: 'pc',
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

      let queryObject = this.productCategoryEntityRepo.createQueryBuilder('pc');

      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.orWhere('pc.vCategoryName LIKE :vCategoryName', {
          vCategoryName: `${inputParams.keyword}%`,
        });
      }
      queryObject.orWhere('pc.eStatus IN (:...eStatus)', {
        eStatus: ['Active'],
      });

      const totalCount = await queryObject.getCount();
      this.settingsParams = custom.getPagination(
        totalCount,
        pageIndex,
        recLimit,
      );
      if (!totalCount) {
        throw new Error('No records found.');
      }

      queryObject = this.productCategoryEntityRepo.createQueryBuilder('pc');

      queryObject.select('pc.id', 'pc_id');
      queryObject.addSelect('pc.vCategoryName', 'pc_category_name');
      queryObject.addSelect('pc.eStatus', 'pc_status');
      queryObject.addSelect('pc.vCategoryImage', 'category_image');
      queryObject.addSelect('pc.vCategoryImage', 'category_images_name');
      queryObject.addSelect(
        '(select count(*) from products as sp where sp.iProductCategoryId =   pc.id)',
        'products_count',
      );
      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.orWhere('pc.vCategoryName LIKE :vCategoryName', {
          vCategoryName: `${inputParams.keyword}%`,
        });
      }
      queryObject.orWhere('pc.eStatus IN (:...eStatus)', {
        eStatus: ['Active'],
      });
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
          val = row.category_image;
          fileConfig = {};
          fileConfig.source = 'local';
          fileConfig.path = 'product_category_images';
          fileConfig.image_name = val;
          fileConfig.extensions = await this.general.getConfigItem(
            'allowed_extensions',
          );
          fileConfig.width = 515;
          fileConfig.height = 335;
          fileConfig.resize_mode = 'fill';
          fileConfig.no_img_req = false;
          val = await this.general.getFile(fileConfig, inputParams);
          data[i].category_image = val;
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
    inputParams.get_product_category_list = this.blockResult.data;

    return inputParams;
  }

  /**
   * finishProductCategoryListSuccess method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  finishProductCategoryListSuccess(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('Product category list found.'),
      fields: [],
    };
    settingFields.fields = [
      'pc_id',
      'pc_category_name',
      'pc_status',
      'category_image',
      'category_images_name',
      'products_count',
    ];

    const outputKeys = ['get_product_category_list'];
    const outputAliases = {
      pc_id: 'id',
      pc_category_name: 'category_name',
      pc_status: 'status',
    };

    const outputData: any = {};
    outputData.settings = { ...settingFields, ...this.settingsParams };
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'product_category_list';

    funcData.output_keys = outputKeys;
    funcData.output_alias = outputAliases;
    funcData.multiple_keys = this.multipleKeys;
    return this.response.outputResponse(outputData, funcData);
  }

  /**
   * finishProductCategoryListFailure method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  finishProductCategoryListFailure(inputParams: any) {
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
        name: 'product_category_list',
      },
    );
  }
}
