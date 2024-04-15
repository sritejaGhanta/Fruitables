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


import { StateEntity } from 'src/entities/state.entity';
import { CityEntity } from 'src/entities/city.entity';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class CityUpdateService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    CityUpdateService.name,
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
    @InjectRepository(StateEntity)
  protected stateEntityRepo: Repository<StateEntity>;
    @InjectRepository(CityEntity)
  protected cityEntityRepo: Repository<CityEntity>;
  
  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.singleKeys = [
      'get_city_state_for_update',
      'get_city_code_for_update',
      'update_city_data',
    ];
  }

  /**
   * startCityUpdate method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startCityUpdate(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.getCityStateForUpdate(inputParams);
      if (!_.isEmpty(inputParams.get_city_state_for_update)) {
      inputParams = await this.getCityCodeForUpdate(inputParams);
      if (!_.isEmpty(inputParams.get_city_code_for_update)) {
        outputResponse = this.codeFailure(inputParams);
      } else {
      inputParams = await this.updateCityData(inputParams);
      if (!_.isEmpty(inputParams.update_city_data)) {
        outputResponse = this.finishSuccess(inputParams);
      } else {
        outputResponse = this.finishFailure(inputParams);
      }
      }
      } else {
        outputResponse = this.stateFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> city_update >>', err);
    }
    return outputResponse;
  }
  

  /**
   * getCityStateForUpdate method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getCityStateForUpdate(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.stateEntityRepo.createQueryBuilder('ms');

      queryObject.select('id', 'ms_id');
      if (!custom.isEmpty(inputParams.id)) {
        queryObject.andWhere('id = :id', { id: inputParams.id });
      }
      if (!custom.isEmpty(inputParams.country_id)) {
        queryObject.andWhere('countryId = :countryId', { countryId: inputParams.country_id });
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
    inputParams.get_city_state_for_update = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * getCityCodeForUpdate method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getCityCodeForUpdate(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.cityEntityRepo.createQueryBuilder('mc');

      queryObject.select('id', 'mc_id');
      if (!custom.isEmpty(inputParams.city_code)) {
        queryObject.andWhere('cityCode = :cityCode', { cityCode: inputParams.city_code });
      }
      if (!custom.isEmpty(inputParams.country_id)) {
        queryObject.andWhere('countryId = :countryId', { countryId: inputParams.country_id });
      }
      if (!custom.isEmpty(inputParams.state_id)) {
        queryObject.andWhere('stateId = :stateId', { stateId: inputParams.state_id });
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
    inputParams.get_city_code_for_update = this.blockResult.data;
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
      message: custom.lang('City code already exists.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'city_update',
      },
    );
  }

  /**
   * updateCityData method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async updateCityData(inputParams: any) {
    this.blockResult = {};
    try {                
      

      const queryColumns: any = {};
      if ('city_name' in inputParams) {
        queryColumns.city = inputParams.city_name;
      }
      if ('city_code' in inputParams) {
        queryColumns.cityCode = inputParams.city_code;
      }
      if ('country_id' in inputParams) {
        queryColumns.countryId = inputParams.country_id;
      }
      if ('state_id' in inputParams) {
        queryColumns.stateId = inputParams.state_id;
      }
      if ('status' in inputParams) {
        queryColumns.status = inputParams.status;
      }

      const queryObject = this.cityEntityRepo
        .createQueryBuilder()
        .update(CityEntity)
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
    inputParams.update_city_data = this.blockResult.data;
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
      message: custom.lang('City updated successfully.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'city_update',
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
      message: custom.lang('Something went wrong, Please try again.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'city_update',
      },
    );
  }

  /**
   * stateFailure method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  stateFailure(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('State / Country does not exists.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'city_update',
      },
    );
  }
}
