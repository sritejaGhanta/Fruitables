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
export class ProductsAddService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    ProductsAddService.name,
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
      'insert_products_data',
      'get_insert_product',
    ];
  }

  /**
   * startProductsAdd method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startProductsAdd(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.insertProductsData(inputParams);
      if (!_.isEmpty(inputParams.insert_products_data)) {
      inputParams = await this.getInsertProduct(inputParams);
        outputResponse = this.productsAddFinishSuccess(inputParams);
      } else {
        outputResponse = this.productsAddFinishFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> products_add >>', err);
    }
    return outputResponse;
  }
  

  /**
   * insertProductsData method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async insertProductsData(inputParams: any) {
    this.blockResult = {};
    try {
      let uploadResult: any = {};
      let uploadConfig: any = {};
      let uploadInfo: any = {};
      let fileProp: any = {};
      let fileInfo: any = {};

      if ('product_image' in inputParams && !custom.isEmpty(inputParams.product_image)) {
        const tmpUploadPath = await this.general.getConfigItem('upload_temp_path');
        if (this.general.isFile(`${tmpUploadPath}${inputParams.product_image}`)) {
          fileInfo = {};
          fileInfo.name = inputParams.product_image;
          fileInfo.file_name = inputParams.product_image;
          fileInfo.file_path = `${tmpUploadPath}${inputParams.product_image}`;
          fileInfo.file_type = this.general.getFileMime(fileInfo.file_path);
          fileInfo.file_size = this.general.getFileSize(fileInfo.file_path);
          fileInfo.max_size = 102400;
          fileInfo.extensions = await this.general.getConfigItem('allowed_extensions');
          uploadInfo.product_image = fileInfo;
        }
      }
      const queryColumns: any = {};
      if ('product_name' in inputParams) {
        queryColumns.vProductName = inputParams.product_name;
      }
      if ('product_image' in uploadInfo && 'name' in uploadInfo.product_image) {
        queryColumns.vProductImage = uploadInfo.product_image.name;
      } else {
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
      const queryObject = this.productsEntityRepo;
      const res = await queryObject.insert(queryColumns);
      const data = {
        insert_id: res.raw.insertId,
      };

      if ('product_image' in uploadInfo && 'name' in uploadInfo.product_image) {
        uploadConfig = {};
        uploadConfig.source = 'local';
        uploadConfig.upload_path = 'product_images/';
        uploadConfig.extensions = uploadInfo.product_image.extensions;
        uploadConfig.file_type = uploadInfo.product_image.file_type;
        uploadConfig.file_size = uploadInfo.product_image.file_size;
        uploadConfig.max_size = uploadInfo.product_image.max_size;
        uploadConfig.src_file = uploadInfo.product_image.file_path;
        uploadConfig.dst_file = uploadInfo.product_image.name;
        uploadResult = this.general.uploadFile(uploadConfig, inputParams);
        // if (!uploadResult.success) {
        // File upload failed
        // }
      }
      const success = 1;
      const message = 'Record(s) inserted.';

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
    inputParams.insert_products_data = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * getInsertProduct method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getInsertProduct(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.productsEntityRepo.createQueryBuilder('p');

      queryObject.leftJoin(ProductCategoryEntity, 'pc', 'p.iProductCategoryId = pc.id');
      queryObject.select('p.id', 'p_id');
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
      if (!custom.isEmpty(inputParams.insert_id)) {
        queryObject.andWhere('p.id = :id', { id: inputParams.insert_id });
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
    inputParams.get_insert_product = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * productsAddFinishSuccess method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  productsAddFinishSuccess(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('Products added successfully.'),
      fields: [],
    };
    settingFields.fields = [
      'insert_id',
    ];

    const outputKeys = [
      'insert_products_data',
    ];
    const outputObjects = [
      'insert_products_data',
    ];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'products_add';

    funcData.output_keys = outputKeys;
    funcData.output_objects = outputObjects;
    funcData.single_keys = this.singleKeys;
    return this.response.outputResponse(outputData, funcData);
  }

  /**
   * productsAddFinishFailure method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  productsAddFinishFailure(inputParams: any) {
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
        name: 'products_add',
      },
    );
  }
}
