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
export class CustomerAddService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    CustomerAddService.name,
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
      'get_customer_email_for_add',
      'prepare_verify_email_link',
      'insert_customer_data',
    ];
  }

  /**
   * startCustomerAdd method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startCustomerAdd(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.getCustomerEmailForAdd(inputParams);
      if (!_.isEmpty(inputParams.get_customer_email_for_add)) {
        outputResponse = this.emailFailure(inputParams);
      } else {
      inputParams = await this.prepareVerifyEmailLink(inputParams);
      inputParams = await this.insertCustomerData(inputParams);
      if (!_.isEmpty(inputParams.insert_customer_data)) {
      inputParams = await this.sendRegistrationEmail(inputParams);
        outputResponse = this.finishSuccess(inputParams);
      } else {
        outputResponse = this.finishFailure(inputParams);
      }
      }
    } catch (err) {
      this.log.error('API Error >> customer_add >>', err);
    }
    return outputResponse;
  }
  

  /**
   * getCustomerEmailForAdd method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getCustomerEmailForAdd(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.customerEntityRepo.createQueryBuilder('mc');

      queryObject.select('id', 'mc_id');
      if (!custom.isEmpty(inputParams.email)) {
        queryObject.andWhere('email = :email', { email: inputParams.email });
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
    inputParams.get_customer_email_for_add = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * emailFailure method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  emailFailure(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('Customer already exists with this email address.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'customer_add',
      },
    );
  }

  /**
   * prepareVerifyEmailLink method is used to process custom function.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async prepareVerifyEmailLink(inputParams: any) {
    let formatData: any = {};
    try {
      //@ts-ignore
      const result = await this.getCustomerVerifyEmailLink(inputParams);

      formatData = this.response.assignFunctionResponse(result);
      inputParams.prepare_verify_email_link = formatData;

      inputParams = this.response.assignSingleRecord(inputParams, formatData);
    } catch (err) {
      this.log.error(err);
    }
    return inputParams;
  }

  /**
   * insertCustomerData method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async insertCustomerData(inputParams: any) {
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
      queryColumns.isMobileVerified = 'No';
      queryColumns.isEmailVerified = 'No';
      if ('reset_code' in inputParams) {
        queryColumns.otpCode = inputParams.reset_code;
      }
      if ('verify_code' in inputParams) {
        queryColumns.verificationCode = inputParams.verify_code;
      }
      if ('status' in inputParams) {
        queryColumns.status = inputParams.status;
      }
      queryColumns.createdAt = () => 'NOW()';
      const queryObject = this.customerEntityRepo;
      const res = await queryObject.insert(queryColumns);
      const data = {
        insert_id: res.raw.insertId,
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
    inputParams.insert_customer_data = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * sendRegistrationEmail method is used to process email notification.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async sendRegistrationEmail(inputParams: any) {
    this.blockResult = {};
    let success: number;
    let message: string;
    try {
      const emailParams: any = {};
      emailParams.to_email = inputParams.email || null;

      emailParams.async = true,
      emailParams.new_priority = 'default';
      emailParams.params = {};
      emailParams.params.NAME = inputParams.full_name || null;
      emailParams.params.USER_EMAIL = inputParams.email || null;
      emailParams.params.VERIFY_EMAIL = inputParams.verify_link || null;

      const extraParams = { ...inputParams };
      extraParams.async = true;

      const res = await this.general.sendMailNotification(
        emailParams,
        'USER_REGISTER',
        extraParams,
      );
      if (!res) {
        throw new Error('Failure in sending email notification.');
      }
      success = 1;
      message = 'Email notification send successfully.';
    } catch (err) {
      success = 0;
      message = err;
    }
    this.blockResult.success = success;
    this.blockResult.message = message;
    inputParams.send_registration_email = this.blockResult;

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
      message: custom.lang('Customer added successfully.'),
      fields: [],
    };
    settingFields.fields = [
      'insert_id',
    ];

    const outputKeys = [
      'insert_customer_data',
    ];
    const outputObjects = [
      'insert_customer_data',
    ];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'customer_add';

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
      message: custom.lang('Something went wrong.Please try again.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'customer_add',
      },
    );
  }
}
