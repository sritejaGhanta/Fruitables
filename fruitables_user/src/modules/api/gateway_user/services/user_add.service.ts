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


import { UserEntity } from 'src/entities/user.entity';
import { CartEntity } from 'src/entities/cart.entity';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class UserAddService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    UserAddService.name,
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
    @InjectRepository(CartEntity)
  protected cartEntityRepo: Repository<CartEntity>;
  
  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.singleKeys = [
      'get_user_id_for_add',
      'insert_user_data',
      'create_cart',
    ];
  }

  /**
   * startUserAdd method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startUserAdd(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.getUserIdForAdd(inputParams);
      if (!_.isEmpty(inputParams.get_user_id_for_add)) {
        outputResponse = this.userAddUniqueFailure(inputParams);
      } else {
      inputParams = await this.insertUserData(inputParams);
      if (!_.isEmpty(inputParams.insert_user_data)) {
      inputParams = await this.createCart(inputParams);
        outputResponse = this.userAddFinishSuccess(inputParams);
      } else {
        outputResponse = this.userAddFinishFailure(inputParams);
      }
      }
    } catch (err) {
      this.log.error('API Error >> user_add >>', err);
    }
    return outputResponse;
  }
  

  /**
   * getUserIdForAdd method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getUserIdForAdd(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.userEntityRepo.createQueryBuilder('u');

      queryObject.select('u.iUserId', 'u_user_id');
      if (!custom.isEmpty(inputParams.email)) {
        queryObject.andWhere('u.vEmail = :vEmail', { vEmail: inputParams.email });
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
    inputParams.get_user_id_for_add = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * userAddUniqueFailure method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  userAddUniqueFailure(inputParams: any) {
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
        name: 'user_add',
      },
    );
  }

  /**
   * insertUserData method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async insertUserData(inputParams: any) {
    this.blockResult = {};
    try {
      const queryColumns: any = {};
      if ('first_name' in inputParams) {
        queryColumns.vFirstName = inputParams.first_name;
      }
      if ('last_name' in inputParams) {
        queryColumns.vLastName = inputParams.last_name;
      }
      if ('email' in inputParams) {
        queryColumns.vEmail = inputParams.email;
      }
      if ('password' in inputParams) {
        queryColumns.vPassword = inputParams.password;
      }
      //@ts-ignore;
      queryColumns.vPassword = this.general.encryptPassword(queryColumns.vPassword, inputParams, {
        field: 'password',
        request: this.requestObj,
      });
      if ('phone_number' in inputParams) {
        queryColumns.vPhoneNumber = inputParams.phone_number;
      }
      if ('dial_code' in inputParams) {
        queryColumns.vDialCode = inputParams.dial_code;
      }
      queryColumns.eStatus = 'Active';
      const queryObject = this.userEntityRepo;
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
    inputParams.insert_user_data = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * createCart method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async createCart(inputParams: any) {
    this.blockResult = {};
    try {
      const queryColumns: any = {};
      if ('insert_id' in inputParams) {
        queryColumns.iUserId = inputParams.insert_id;
      }
      queryColumns.iProductsCount = () => '0';
      queryColumns.fCost = () => '0';
      queryColumns.fShippingCost = () => '0';
      queryColumns.fTotalCost = '0';
      const queryObject = this.cartEntityRepo;
      const res = await queryObject.insert(queryColumns);
      const data = {
        insert_id1: res.raw.insertId,
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
    inputParams.create_cart = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * userAddFinishSuccess method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  userAddFinishSuccess(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('User added successfully.'),
      fields: [],
    };
    settingFields.fields = [
      'insert_id',
    ];

    const outputKeys = [
      'insert_user_data',
    ];
    const outputObjects = [
      'insert_user_data',
    ];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'user_add';

    funcData.output_keys = outputKeys;
    funcData.output_objects = outputObjects;
    funcData.single_keys = this.singleKeys;
    return this.response.outputResponse(outputData, funcData);
  }

  /**
   * userAddFinishFailure method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  userAddFinishFailure(inputParams: any) {
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
        name: 'user_add',
      },
    );
  }
}
