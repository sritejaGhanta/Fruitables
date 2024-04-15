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
export class CityAddService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    CityAddService.name,
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
      'get_city_state_for_add',
      'insert_city_data',
    ];
    this.multipleKeys = [
      'get_city_code_for_add',
    ];
  }

  /**
   * startCityAdd method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startCityAdd(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.getCityStateForAdd(inputParams);
      if (!_.isEmpty(inputParams.get_city_state_for_add)) {
      inputParams = await this.getCityCodeForAdd(inputParams);
      if (!_.isEmpty(inputParams.get_city_code_for_add)) {
        outputResponse = this.codeFailure(inputParams);
      } else {
      inputParams = await this.insertCityData(inputParams);
      if (!_.isEmpty(inputParams.insert_city_data)) {
        outputResponse = this.finishSuccess(inputParams);
      } else {
        outputResponse = this.finishFailure(inputParams);
      }
      }
      } else {
        outputResponse = this.stateFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> city_add >>', err);
    }
    return outputResponse;
  }
  

  /**
   * getCityStateForAdd method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getCityStateForAdd(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.stateEntityRepo.createQueryBuilder('ms');

      queryObject.select('id', 'ms_id');
      if (!custom.isEmpty(inputParams.state_id)) {
        queryObject.andWhere('id = :id', { id: inputParams.state_id });
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
    inputParams.get_city_state_for_add = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * getCityCodeForAdd method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getCityCodeForAdd(inputParams: any) {
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
    inputParams.get_city_code_for_add = this.blockResult.data;

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
        name: 'city_add',
      },
    );
  }

  /**
   * insertCityData method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async insertCityData(inputParams: any) {
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
      const queryObject = this.cityEntityRepo;
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
    inputParams.insert_city_data = this.blockResult.data;
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
      message: custom.lang('City added successfully.'),
      fields: [],
    };
    settingFields.fields = [
      'insert_id',
    ];

    const outputKeys = [
      'insert_city_data',
    ];
    const outputObjects = [
      'insert_city_data',
    ];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'city_add';

    funcData.output_keys = outputKeys;
    funcData.output_objects = outputObjects;
    funcData.single_keys = this.singleKeys;
    funcData.multiple_keys = this.multipleKeys;
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
        name: 'city_add',
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
        name: 'city_add',
      },
    );
  }
}
