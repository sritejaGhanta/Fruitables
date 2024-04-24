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


import { UserEntity } from 'src/entities/user.entity';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class UserUpdateService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    UserUpdateService.name,
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
    @InjectRepository(UserEntity)
  protected userEntityRepo: Repository<UserEntity>;
  
  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.singleKeys = [
      'get_user_id_for_update',
      'update_user_data',
      'get_update_user_details',
    ];
  }

  /**
   * startUserUpdate method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startUserUpdate(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.getUserIdForUpdate(inputParams);
      if (_.isEmpty(inputParams.get_user_id_for_update)) {
        outputResponse = this.userUpdateUniqueFailure(inputParams);
      } else {
      inputParams = await this.updateUserData(inputParams);
      if (!_.isEmpty(inputParams.update_user_data)) {
      inputParams = await this.getUpdateUserDetails(inputParams);
        outputResponse = this.userUpdateFinishSuccess(inputParams);
      } else {
        outputResponse = this.userUpdateFinishFailure(inputParams);
      }
      }
    } catch (err) {
      this.log.error('API Error >> user_update >>', err);
    }
    return outputResponse;
  }
  

  /**
   * getUserIdForUpdate method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getUserIdForUpdate(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.userEntityRepo.createQueryBuilder('u');

      queryObject.select('u.iUserId', 'u_user_id');
      if (!custom.isEmpty(inputParams.id)) {
        queryObject.andWhere('u.iUserId = :iUserId', { iUserId: inputParams.id });
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
    inputParams.get_user_id_for_update = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * userUpdateUniqueFailure method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  userUpdateUniqueFailure(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 0,
      message: custom.lang('User record already exists.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'user_update',
      },
    );
  }

  /**
   * updateUserData method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async updateUserData(inputParams: any) {
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
        queryColumns.vFirstName = inputParams.first_name;
      }
      if ('last_name' in inputParams) {
        queryColumns.vLastName = inputParams.last_name;
      }
      if ('profile_image' in uploadInfo && 'name' in uploadInfo.profile_image) {
        queryColumns.vProfileImage = uploadInfo.profile_image.name;
      } else {
        queryColumns.vProfileImage = inputParams.profile_image;
      }
      if ('phone_number' in inputParams) {
        queryColumns.vPhoneNumber = inputParams.phone_number;
      }
      if ('dial_code' in inputParams) {
        queryColumns.vDialCode = inputParams.dial_code;
      }

      const queryObject = this.userEntityRepo
        .createQueryBuilder()
        .update(UserEntity)
        .set(queryColumns);
      if (!custom.isEmpty(inputParams.id)) {
        queryObject.andWhere('iUserId = :iUserId', { iUserId: inputParams.id });
      }
      const res = await queryObject.execute();
      const data = {
        affected_rows: res.affected,
      };

      if ('profile_image' in uploadInfo && 'name' in uploadInfo.profile_image) {
        uploadConfig = {};
        uploadConfig.source = 'local';
        uploadConfig.upload_path = 'user_profile_image/';
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
    inputParams.update_user_data = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * getUpdateUserDetails method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getUpdateUserDetails(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.userEntityRepo.createQueryBuilder('u');

      queryObject.select('u.iUserId', 'u_user_id_1');
      queryObject.addSelect('u.vProfileImage', 'u_profile_image');
      queryObject.addSelect('u.vFirstName', 'u_first_name');
      queryObject.addSelect('u.vLastName', 'u_last_name');
      queryObject.addSelect('u.vEmail', 'u_email');
      queryObject.addSelect('u.vPhoneNumber', 'u_phone_number');
      queryObject.addSelect('u.vDialCode', 'u_dial_code');
      queryObject.addSelect('u.vProfileImage', 'profile_image_name');
      if (!custom.isEmpty(inputParams.id)) {
        queryObject.andWhere('u.iUserId = :iUserId', { iUserId: inputParams.id });
      }

      const data: any = await queryObject.getRawOne();
      if (!_.isObject(data) || _.isEmpty(data)) {
        throw new Error('No records found.');
      }

      let fileConfig: FileFetchDto;
      let val;
      if (_.isObject(data) && !_.isEmpty(data)) {
        const row: any = data;
          val = row.u_profile_image;
          fileConfig = {};
          fileConfig.source = 'local';
          fileConfig.path = 'user_profile_image';
          fileConfig.image_name = val;
          fileConfig.extensions = await this.general.getConfigItem('allowed_extensions');
          fileConfig.no_img_req = false;
          val = await this.general.getFile(fileConfig, inputParams);
          data['u_profile_image'] = val;
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
    inputParams.get_update_user_details = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * userUpdateFinishSuccess method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  userUpdateFinishSuccess(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('User record updated successfully.'),
      fields: [],
    };
    settingFields.fields = [
      'u_user_id_1',
      'u_profile_image',
      'u_first_name',
      'u_last_name',
      'u_email',
      'u_phone_number',
      'u_dial_code',
      'profile_image_name',
    ];

    const outputKeys = [
      'get_update_user_details',
    ];
    const outputAliases = {
      u_user_id_1: 'id',
      u_profile_image: 'profile_image',
      u_first_name: 'first_name',
      u_last_name: 'last_name',
      u_email: 'email',
      u_phone_number: 'phone_number',
      u_dial_code: 'dial_code',
    };
    const outputObjects = [
      'get_update_user_details',
    ];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'user_update';

    funcData.output_keys = outputKeys;
    funcData.output_alias = outputAliases;
    funcData.output_objects = outputObjects;
    funcData.single_keys = this.singleKeys;
    return this.response.outputResponse(outputData, funcData);
  }

  /**
   * userUpdateFinishFailure method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  userUpdateFinishFailure(inputParams: any) {
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
        name: 'user_update',
      },
    );
  }
}
