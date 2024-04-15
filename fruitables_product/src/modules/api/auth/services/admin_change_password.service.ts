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


import { AdminEntity } from 'src/entities/admin.entity';
import { AdminPasswordsEntity } from 'src/entities/admin-passwords.entity';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class AdminChangePasswordService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    AdminChangePasswordService.name,
  ).getInstance();
  protected inputParams: object = {};
  protected blockResult: BlockResultDto;
  protected settingsParams: SettingsParamsDto;
  protected singleKeys: any[] = [];
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
    @InjectRepository(AdminEntity)
  protected adminEntityRepo: Repository<AdminEntity>;
    @InjectRepository(AdminPasswordsEntity)
  protected adminPasswordsEntityRepo: Repository<AdminPasswordsEntity>;
  
  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.singleKeys = [
      'get_admin_details',
      'verify_reset_password',
      'change_admin_password',
      'insert_new_password',
    ];
    this.multipleKeys = [
      'get_old_passwords',
      'verify_old_passwords',
    ];
  }

  /**
   * startAdminChangePassword method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startAdminChangePassword(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.getAdminDetails(inputParams);
      inputParams = await this.verifyResetPassword(inputParams);
      if (!_.isEmpty(inputParams.get_admin_details) && inputParams.is_matched === 1) {
      inputParams = await this.getOldPasswords(inputParams);
      inputParams = await this.verifyOldPasswords(inputParams);
      if (inputParams.is_old_password === 0) {
      inputParams = await this.changeAdminPassword(inputParams);
      inputParams = await this.emailAdminChangePassword(inputParams);
      inputParams = await this.insertNewPassword(inputParams);
        outputResponse = this.finishSuccess(inputParams);
      } else {
        outputResponse = this.passwordFailure(inputParams);
      }
      } else {
        outputResponse = this.isAdminExists1(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> admin_change_password >>', err);
    }
    return outputResponse;
  }
  

  /**
   * getAdminDetails method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getAdminDetails(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.adminEntityRepo.createQueryBuilder('ma');

      queryObject.select('id', 'ma_id');
      queryObject.addSelect('password', 'ma_password');
      queryObject.andWhere('id = :id', { id: this.requestObj.user.id });

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
    inputParams.get_admin_details = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * verifyResetPassword method is used to process custom function.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async verifyResetPassword(inputParams: any) {
    let formatData: any = {};
    try {
      //@ts-ignore
      const result = await this.general.verifyAdminResetPassword(inputParams);

      formatData = this.response.assignFunctionResponse(result);
      inputParams.verify_reset_password = formatData;

      inputParams = this.response.assignSingleRecord(inputParams, formatData);
    } catch (err) {
      this.log.error(err);
    }
    return inputParams;
  }

  /**
   * getOldPasswords method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getOldPasswords(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.adminPasswordsEntityRepo.createQueryBuilder('map');

      queryObject.select('password', 'map_password');
      queryObject.andWhere('adminId = :adminId', { adminId: this.requestObj.user.id });

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
    inputParams.get_old_passwords = this.blockResult.data;

    return inputParams;
  }

  /**
   * verifyOldPasswords method is used to process custom function.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async verifyOldPasswords(inputParams: any) {
    let formatData: any = {};
    try {
      //@ts-ignore
      const result = await this.general.verifyAdminOldPasswords(inputParams);

      formatData = this.response.assignFunctionResponse(result);
      inputParams.verify_old_passwords = formatData;

      inputParams = this.response.assignSingleRecord(inputParams, formatData);
    } catch (err) {
      this.log.error(err);
    }
    return inputParams;
  }

  /**
   * changeAdminPassword method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async changeAdminPassword(inputParams: any) {
    this.blockResult = {};
    try {                
      

      const queryColumns: any = {};
      if ('new_password' in inputParams) {
        queryColumns.password = inputParams.new_password;
      }
      //@ts-ignore;
      queryColumns.password = this.general.encryptPassword(queryColumns.password, inputParams, {
        field: 'new_password',
        request: this.requestObj,
      });

      const queryObject = this.adminEntityRepo
        .createQueryBuilder()
        .update(AdminEntity)
        .set(queryColumns);
      queryObject.andWhere('id = :id', { id: this.requestObj.user.id });
      const res = await queryObject.execute();
      const data = {
        affected_rows: res.affected,
      };

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
    inputParams.change_admin_password = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * emailAdminChangePassword method is used to process email notification.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async emailAdminChangePassword(inputParams: any) {
    this.blockResult = {};
    let success: number;
    let message: string;
    try {
      const emailParams: any = {};
      emailParams.to_email = this.requestObj.user.email || null;

      emailParams.async = true,
      emailParams.new_priority = 'default';
      emailParams.params = {};
      emailParams.params.NAME = this.requestObj.user.name || null;

      const extraParams = { ...inputParams };
      extraParams.async = true;

      const res = await this.general.sendMailNotification(
        emailParams,
        'ADMIN_PASSWORD_CHANGED',
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
    inputParams.email_admin_change_password = this.blockResult;

    return inputParams;
  }

  /**
   * insertNewPassword method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async insertNewPassword(inputParams: any) {
    this.blockResult = {};
    try {
      const queryColumns: any = {};
      queryColumns.adminId = this.requestObj.user.id;
      if ('ma_password' in inputParams) {
        queryColumns.password = inputParams.ma_password;
      }
      queryColumns.createdAt = () => 'NOW()';
      queryColumns.status = 'Active';
      const queryObject = this.adminPasswordsEntityRepo;
      const res = await queryObject.insert(queryColumns);
      const data = {
        insert_id: res.raw.insertId,
      };

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
    inputParams.insert_new_password = this.blockResult.data;
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
      message: custom.lang('Password changed successfully.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'admin_change_password',
      },
    );
  }

  /**
   * passwordFailure method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  passwordFailure(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 0,
      message: custom.lang('You have already used this password, Please enter different password.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'admin_change_password',
      },
    );
  }

  /**
   * isAdminExists1 method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  isAdminExists1(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 0,
      message: custom.lang('Old password does not matched.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'admin_change_password',
      },
    );
  }
}
