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


import { CustomerEntity } from 'src/entities/customer.entity';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class CustomerUpdateService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    CustomerUpdateService.name,
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
      'update_customer_data',
    ];
  }

  /**
   * startCustomerUpdate method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startCustomerUpdate(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.updateCustomerData(inputParams);
      if (!_.isEmpty(inputParams.update_customer_data)) {
        outputResponse = this.finishSuccess(inputParams);
      } else {
        outputResponse = this.finishFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> customer_update >>', err);
    }
    return outputResponse;
  }
  

  /**
   * updateCustomerData method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async updateCustomerData(inputParams: any) {
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
      if ('first_name' in inputParams) {
        queryColumns.firstName = inputParams.first_name;
      }
      if ('last_name' in inputParams) {
        queryColumns.lastName = inputParams.last_name;
      }
      if ('email' in inputParams) {
        queryColumns.email = inputParams.email;
      }
      if ('dial_code' in inputParams) {
        queryColumns.dialCode = inputParams.dial_code;
      }
      if ('phone_number' in inputParams) {
        queryColumns.phonenumber = inputParams.phone_number;
      }
      if ('profile_image' in uploadInfo && 'name' in uploadInfo.profile_image) {
        queryColumns.profileImage = uploadInfo.profile_image.name;
      } else {
        queryColumns.profileImage = inputParams.profile_image;
      }
      queryColumns.updatedAt = () => 'NOW()';
      if ('status' in inputParams) {
        queryColumns.status = inputParams.status;
      }

      const queryObject = this.customerEntityRepo
        .createQueryBuilder()
        .update(CustomerEntity)
        .set(queryColumns);
      if (!custom.isEmpty(inputParams.id)) {
        queryObject.andWhere('id = :id', { id: inputParams.id });
      }
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
    inputParams.update_customer_data = this.blockResult.data;
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
      message: custom.lang('Customer data updated successfully.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'customer_update',
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
        name: 'customer_update',
      },
    );
  }
}
