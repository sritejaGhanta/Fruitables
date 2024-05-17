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

import { UserAddressEntity } from 'src/entities/user-address.entity';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class UserAddressChangeStatusService extends BaseService {
  protected readonly log = new LoggerHandler(
    UserAddressChangeStatusService.name,
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
  @InjectRepository(UserAddressEntity)
  protected userAddressEntityRepo: Repository<UserAddressEntity>;

  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.multipleKeys = ['update_user_address_status'];
  }

  /**
   * startUserAddressChangeStatus method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startUserAddressChangeStatus(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;

      inputParams = await this.updateUserAddressStatus(inputParams);
      if (!_.isEmpty(inputParams.update_user_address_status)) {
        outputResponse = this.userAddressChangeStatusFinishSuccess(inputParams);
      } else {
        outputResponse = this.userAddressChangeStatusFinishFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> user_address_change_status >>', err);
    }
    return outputResponse;
  }

  /**
   * updateUserAddressStatus method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async updateUserAddressStatus(inputParams: any) {
    this.blockResult = {};
    try {
      const queryColumns: any = {};
      if ('status' in inputParams) {
        queryColumns.eStatus = inputParams.status;
      }

      const queryObject = this.userAddressEntityRepo
        .createQueryBuilder()
        .update(UserAddressEntity)
        .set(queryColumns);
      if (!custom.isEmpty(inputParams.ids)) {
        queryObject.andWhere('id IN (:...id)', { id: inputParams.ids });
      }
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
    inputParams.update_user_address_status = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * userAddressChangeStatusFinishSuccess method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  userAddressChangeStatusFinishSuccess(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('Status updated successfully.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'user_address_change_status',
      },
    );
  }

  /**
   * userAddressChangeStatusFinishFailure method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  userAddressChangeStatusFinishFailure(inputParams: any) {
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
        name: 'user_address_change_status',
      },
    );
  }
}
