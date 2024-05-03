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


import { LogHistoryEntity } from 'src/entities/log-history.entity';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class CustomerLogoutService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    CustomerLogoutService.name,
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
    @InjectRepository(LogHistoryEntity)
  protected logHistoryEntityRepo: Repository<LogHistoryEntity>;
  
  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.singleKeys = [
      'update_customer_logout',
    ];
  }

  /**
   * startCustomerLogout method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startCustomerLogout(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      if (this.requestObj.user.log_id > 0) {
      inputParams = await this.updateCustomerLogout(inputParams);
      }
        outputResponse = this.finishSuccess(inputParams);
    } catch (err) {
      this.log.error('API Error >> customer_logout >>', err);
    }
    return outputResponse;
  }
  

  /**
   * updateCustomerLogout method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async updateCustomerLogout(inputParams: any) {
    this.blockResult = {};
    try {                
      

      const queryColumns: any = {};
      queryColumns.logoutDate = () => 'NOW()';

      const queryObject = this.logHistoryEntityRepo
        .createQueryBuilder()
        .update(LogHistoryEntity)
        .set(queryColumns);
      queryObject.andWhere('userId = :userId', { userId: this.requestObj.user.customer_id });
      queryObject.andWhere('userType IN (:...userType)', { userType :['Front'] });
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
    inputParams.update_customer_logout = this.blockResult.data;
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
      message: custom.lang('Logout successfully.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'customer_logout',
      },
    );
  }
}
