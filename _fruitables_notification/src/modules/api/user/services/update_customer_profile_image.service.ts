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


import { CustomerEntity } from 'src/entities/customer.entity';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class UpdateCustomerProfileImageService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    UpdateCustomerProfileImageService.name,
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
    @InjectRepository(CustomerEntity)
  protected customerEntityRepo: Repository<CustomerEntity>;
  
  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.singleKeys = [
      'update_customer_image',
      'get_customer_image',
    ];
  }

  /**
   * startUpdateCustomerProfileImage method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startUpdateCustomerProfileImage(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.updateCustomerImage(inputParams);
      if (!_.isEmpty(inputParams.update_customer_image)) {
      inputParams = await this.getCustomerImage(inputParams);
        outputResponse = this.finishSuccess(inputParams);
      } else {
        outputResponse = this.finishFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> update_customer_profile_image >>', err);
    }
    return outputResponse;
  }
  

  /**
   * updateCustomerImage method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async updateCustomerImage(inputParams: any) {
    this.blockResult = {};
    try {                
      

      let uploadResult: any = {};
      let uploadConfig: any = {};
      let uploadInfo: any = {};
      let fileProp: any = {};
      let fileInfo: any = {};

      if ('profile_image' in inputParams && !custom.isEmpty(inputParams.profile_image)) {
        const tmpUploadPath = await this.general.getConfigItem('upload_temp_path');
        if (this.general.isFile(`${tmpUploadPath}${inputParams.profile_image}`)) {
          fileInfo = {};
          fileInfo.name = inputParams.profile_image;
          fileInfo.file_name = inputParams.profile_image;
          fileInfo.file_path = `${tmpUploadPath}${inputParams.profile_image}`;
          fileInfo.file_type = this.general.getFileMime(fileInfo.file_path);
          fileInfo.file_size = this.general.getFileSize(fileInfo.file_path);
          fileInfo.max_size = 102400;
          fileInfo.extensions = await this.general.getConfigItem('allowed_extensions');
          uploadInfo.profile_image = fileInfo;
        }
      }
      const queryColumns: any = {};
      if ('profile_image' in uploadInfo && 'name' in uploadInfo.profile_image) {
        queryColumns.profileImage = uploadInfo.profile_image.name;
      } else {
        queryColumns.profileImage = inputParams.profile_image;
      }
      queryColumns.updatedAt = () => 'NOW()';

      const queryObject = this.customerEntityRepo
        .createQueryBuilder()
        .update(CustomerEntity)
        .set(queryColumns);
      queryObject.andWhere('id = :id', { id: this.requestObj.user.customer_id });
      const res = await queryObject.execute();
      const data = {
        affected_rows: res.affected,
      };

      if ('profile_image' in uploadInfo && 'name' in uploadInfo.profile_image) {
        uploadConfig = {};
        uploadConfig.source = 'local';
        uploadConfig.upload_path = 'profile_image/';
        uploadConfig.extensions = uploadInfo.profile_image.extensions;
        uploadConfig.file_type = uploadInfo.profile_image.file_type;
        uploadConfig.file_size = uploadInfo.profile_image.file_size;
        uploadConfig.max_size = uploadInfo.profile_image.max_size;
        uploadConfig.src_file = uploadInfo.profile_image.file_path;
        uploadConfig.dst_file = uploadInfo.profile_image.name;
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
    inputParams.update_customer_image = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * getCustomerImage method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getCustomerImage(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.customerEntityRepo.createQueryBuilder('mc');

      queryObject.select('id', 'mc_id');
      queryObject.addSelect('profileImage', 'mc_profile_image');
      queryObject.andWhere('id = :id', { id: this.requestObj.user.customer_id });

      const data: any = await queryObject.getRawOne();
      if (!_.isObject(data) || _.isEmpty(data)) {
        throw new Error('No records found.');
      }

      let fileConfig: FileFetchDto;
      let val;
      if (_.isObject(data) && !_.isEmpty(data)) {
        const row: any = data;
          val = row.mc_profile_image;
          fileConfig = {};
          fileConfig.source = 'local';
          fileConfig.path = 'profile_image';
          fileConfig.image_name = val;
          fileConfig.extensions = await this.general.getConfigItem('allowed_extensions');
          fileConfig.color = 'FFFFFF';
          val = await this.general.getFile(fileConfig, inputParams);
          data['mc_profile_image'] = val;
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
    inputParams.get_customer_image = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
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
      message: custom.lang('Profile image updated successfully.'),
      fields: [],
    };
    settingFields.fields = [
      'mc_id',
      'mc_profile_image',
    ];

    const outputKeys = [
      'get_customer_image',
    ];
    const outputObjects = [
      'get_customer_image',
    ];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'update_customer_profile_image';

    funcData.output_keys = outputKeys;
    funcData.output_objects = outputObjects;
    funcData.single_keys = this.singleKeys;
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
      success: 0,
      message: custom.lang('Something went wrong. Please try again.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'update_customer_profile_image',
      },
    );
  }
}
