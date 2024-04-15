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


import { CountryEntity } from 'src/entities/country.entity';
import { StateEntity } from 'src/entities/state.entity';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class StateUpdateService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    StateUpdateService.name,
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
    @InjectRepository(CountryEntity)
  protected countryEntityRepo: Repository<CountryEntity>;
    @InjectRepository(StateEntity)
  protected stateEntityRepo: Repository<StateEntity>;
  
  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.singleKeys = [
      'get_state_country_for_update',
      'get_state_code_for_update',
      'update_state_data',
    ];
  }

  /**
   * startStateUpdate method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startStateUpdate(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.getStateCountryForUpdate(inputParams);
      if (!_.isEmpty(inputParams.get_state_country_for_update)) {
      inputParams = await this.getStateCodeForUpdate(inputParams);
      if (!_.isEmpty(inputParams.get_state_code_for_update)) {
        outputResponse = this.codeFailure(inputParams);
      } else {
      inputParams = await this.updateStateData(inputParams);
      if (!_.isEmpty(inputParams.update_state_data)) {
        outputResponse = this.finishSuccess(inputParams);
      } else {
        outputResponse = this.finishFailure(inputParams);
      }
      }
      } else {
        outputResponse = this.countryFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> state_update >>', err);
    }
    return outputResponse;
  }
  

  /**
   * getStateCountryForUpdate method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getStateCountryForUpdate(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.countryEntityRepo.createQueryBuilder('mc');

      queryObject.select('id', 'mc_id');
      if (!custom.isEmpty(inputParams.country_id)) {
        queryObject.andWhere('id = :id', { id: inputParams.country_id });
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
    inputParams.get_state_country_for_update = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * getStateCodeForUpdate method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getStateCodeForUpdate(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.stateEntityRepo.createQueryBuilder('ms');

      queryObject.select('id', 'ms_id');
      if (!custom.isEmpty(inputParams.state_code)) {
        queryObject.andWhere('stateCode = :stateCode', { stateCode: inputParams.state_code });
      }
      if (!custom.isEmpty(inputParams.country_id)) {
        queryObject.andWhere('countryId = :countryId', { countryId: inputParams.country_id });
      }
      if (!custom.isEmpty(inputParams.id)) {
        queryObject.andWhere('id <> :id', { id: inputParams.id });
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
    inputParams.get_state_code_for_update = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * codeFailure method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  codeFailure(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 0,
      message: custom.lang('State code already exists.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'state_update',
      },
    );
  }

  /**
   * updateStateData method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async updateStateData(inputParams: any) {
    this.blockResult = {};
    try {                
      

      const queryColumns: any = {};
      if ('state' in inputParams) {
        queryColumns.state = inputParams.state;
      }
      if ('state_code' in inputParams) {
        queryColumns.stateCode = inputParams.state_code;
      }
      if ('country_id' in inputParams) {
        queryColumns.countryId = inputParams.country_id;
      }
      if ('status' in inputParams) {
        queryColumns.status = inputParams.status;
      }

      const queryObject = this.stateEntityRepo
        .createQueryBuilder()
        .update(StateEntity)
        .set(queryColumns);
      if (!custom.isEmpty(inputParams.id)) {
        queryObject.andWhere('id = :id', { id: inputParams.id });
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
    inputParams.update_state_data = this.blockResult.data;
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
      message: custom.lang('State updated successfully.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'state_update',
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
        name: 'state_update',
      },
    );
  }

  /**
   * countryFailure method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  countryFailure(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 0,
      message: custom.lang('Country does not exists.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'state_update',
      },
    );
  }
}
