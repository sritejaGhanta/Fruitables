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


import { ProductCategoryEntity } from 'src/entities/product-category.entity';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class ProductCategoryUpdateService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    ProductCategoryUpdateService.name,
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
    @InjectRepository(ProductCategoryEntity)
  protected productCategoryEntityRepo: Repository<ProductCategoryEntity>;
  
  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.singleKeys = [
      'get_id_for_update',
      'update_product_category_data',
      'get_updated_category',
    ];
  }

  /**
   * startProductCategoryUpdate method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startProductCategoryUpdate(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.getIdForUpdate(inputParams);
      if (!_.isEmpty(inputParams.get_id_for_update)) {
        outputResponse = this.productCategoryUpdateUniqueFailure(inputParams);
      } else {
      inputParams = await this.updateProductCategoryData(inputParams);
      if (!_.isEmpty(inputParams.update_product_category_data)) {
      inputParams = await this.getUpdatedCategory(inputParams);
        outputResponse = this.productCategoryUpdateFinishSuccess(inputParams);
      } else {
        outputResponse = this.productCategoryUpdateFinishFailure(inputParams);
      }
      }
    } catch (err) {
      this.log.error('API Error >> product_category_update >>', err);
    }
    return outputResponse;
  }
  

  /**
   * getIdForUpdate method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getIdForUpdate(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.productCategoryEntityRepo.createQueryBuilder('pc');

      queryObject.select('pc.id', 'pc_id');
      if (!custom.isEmpty(inputParams.category_name)) {
        queryObject.andWhere('pc.vCategoryName = :vCategoryName', { vCategoryName: inputParams.category_name });
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
    inputParams.get_id_for_update = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * productCategoryUpdateUniqueFailure method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  productCategoryUpdateUniqueFailure(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 0,
      message: custom.lang('Product category record already exists.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'product_category_update',
      },
    );
  }

  /**
   * updateProductCategoryData method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async updateProductCategoryData(inputParams: any) {
    this.blockResult = {};
    try {                
      
      const extraConfig = {
        request_obj: this.requestObj,
      };

      let uploadResult: any = {};
      let uploadConfig: any = {};
      let uploadInfo: any = {};
      let fileProp: any = {};
      let fileInfo: any = {};

      if ('vcategoryimage' in inputParams && !custom.isEmpty(inputParams.vcategoryimage)) {
        const tmpUploadPath = await this.general.getConfigItem('upload_temp_path');
        if (this.general.isFile(`${tmpUploadPath}${inputParams.vcategoryimage}`)) {
          fileInfo = {};
          fileInfo.name = inputParams.vcategoryimage;
          fileInfo.file_name = inputParams.vcategoryimage;
          fileInfo.file_path = `${tmpUploadPath}${inputParams.vcategoryimage}`;
          fileInfo.file_type = this.general.getFileMime(fileInfo.file_path);
          fileInfo.file_size = this.general.getFileSize(fileInfo.file_path);
          fileInfo.max_size = 102400;
          fileInfo.extensions = await this.general.getConfigItem('allowed_extensions');
          uploadInfo.vcategoryimage = fileInfo;
        }
      }
      const queryColumns: any = {};
      if ('category_name' in inputParams) {
        queryColumns.vCategoryName = inputParams.category_name;
      }
      if ('status' in inputParams) {
        queryColumns.eStatus = inputParams.status;
      }
      if ('vCategoryImage' in uploadInfo && 'name' in uploadInfo.vCategoryImage) {
        queryColumns.vCategoryImage = uploadInfo.vCategoryImage.name;
      } else {
        queryColumns.vCategoryImage = inputParams.vCategoryImage;
      }

      const queryObject = this.productCategoryEntityRepo
        .createQueryBuilder()
        .update(ProductCategoryEntity)
        .set(queryColumns);
      if (!custom.isEmpty(inputParams.id)) {
        queryObject.andWhere('id = :id', { id: inputParams.id });
      }
      //@ts-ignore;              
      this.getWhereClause(queryObject, inputParams, extraConfig);
      const res = await queryObject.execute();
      const data = {
        affected_rows: res.affected,
      };

      if ('vcategoryimage' in uploadInfo && 'name' in uploadInfo.vcategoryimage) {
        uploadConfig = {};
        uploadConfig.source = 'local';
        uploadConfig.upload_path = 'product_category_images/';
        uploadConfig.extensions = uploadInfo.vcategoryimage.extensions;
        uploadConfig.file_type = uploadInfo.vcategoryimage.file_type;
        uploadConfig.file_size = uploadInfo.vcategoryimage.file_size;
        uploadConfig.max_size = uploadInfo.vcategoryimage.max_size;
        uploadConfig.src_file = uploadInfo.vcategoryimage.file_path;
        uploadConfig.dst_file = uploadInfo.vcategoryimage.name;
        uploadResult = this.general.uploadFile(uploadConfig, inputParams);
        // if (!uploadResult.success) {
        // File upload failed
        // }
      }
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
    inputParams.update_product_category_data = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * getUpdatedCategory method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getUpdatedCategory(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.productCategoryEntityRepo.createQueryBuilder('pc');

      queryObject.select('pc.vCategoryName', 'pc_category_name');
      queryObject.addSelect('pc.eStatus', 'pc_status');
      queryObject.addSelect('pc.vCategoryImage', 'pc_category_image');
      queryObject.addSelect('pc.vCategoryImage', 'category_images_name');
      if (!custom.isEmpty(inputParams.id)) {
        queryObject.andWhere('pc.id = :id', { id: inputParams.id });
      }

      const data: any = await queryObject.getRawOne();
      if (!_.isObject(data) || _.isEmpty(data)) {
        throw new Error('No records found.');
      }

      let fileConfig: FileFetchDto;
      let val;
      if (_.isObject(data) && !_.isEmpty(data)) {
        const row: any = data;
          val = row.pc_category_image;
          fileConfig = {};
          fileConfig.source = 'local';
          fileConfig.path = 'product_category_images';
          fileConfig.image_name = val;
          fileConfig.extensions = await this.general.getConfigItem('allowed_extensions');
          val = await this.general.getFile(fileConfig, inputParams);
          data['pc_category_image'] = val;
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
    inputParams.get_updated_category = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * productCategoryUpdateFinishSuccess method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  productCategoryUpdateFinishSuccess(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('Product category record updated successfully.'),
      fields: [],
    };
    settingFields.fields = [
      'pc_category_name',
      'pc_status',
      'pc_category_image',
      'category_images_name',
    ];

    const outputKeys = [
      'get_updated_category',
    ];
    const outputAliases = {
      pc_category_name: 'category_name',
      pc_status: 'status',
      pc_category_image: 'category_image',
    };
    const outputObjects = [
      'get_updated_category',
    ];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'product_category_update';

    funcData.output_keys = outputKeys;
    funcData.output_alias = outputAliases;
    funcData.output_objects = outputObjects;
    funcData.single_keys = this.singleKeys;
    return this.response.outputResponse(outputData, funcData);
  }

  /**
   * productCategoryUpdateFinishFailure method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  productCategoryUpdateFinishFailure(inputParams: any) {
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
        name: 'product_category_update',
      },
    );
  }
}
