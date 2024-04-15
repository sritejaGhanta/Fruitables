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
export class StateAddService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    StateAddService.name,
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
      'get_state_country_for_add',
      'insert_state_data',
    ];
    this.multipleKeys = [
      'get_state_code_for_add',
    ];
  }

  /**
   * startStateAdd method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startStateAdd(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.getStateCountryForAdd(inputParams);
      if (!_.isEmpty(inputParams.get_state_country_for_add)) {
      inputParams = await this.getStateCodeForAdd(inputParams);
      if (!_.isEmpty(inputParams.get_state_code_for_add)) {
        outputResponse = this.codeFailure(inputParams);
      } else {
      inputParams = await this.insertStateData(inputParams);
      if (!_.isEmpty(inputParams.insert_state_data)) {
        outputResponse = this.finishSuccess(inputParams);
      } else {
        outputResponse = this.finishFailure(inputParams);
      }
      }
      } else {
        outputResponse = this.countryFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> state_add >>', err);
    }
    return outputResponse;
  }
  

  /**
   * getStateCountryForAdd method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getStateCountryForAdd(inputParams: any) {
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
    inputParams.get_state_country_for_add = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * getStateCodeForAdd method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getStateCodeForAdd(inputParams: any) {
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
    inputParams.get_state_code_for_add = this.blockResult.data;

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
        name: 'state_add',
      },
    );
  }

  /**
   * insertStateData method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async insertStateData(inputParams: any) {
    this.blockResult = {};
    try {
      const queryColumns: any = {};
      if ('state_name' in inputParams) {
        queryColumns.state = inputParams.state_name;
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
      const queryObject = this.stateEntityRepo;
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
    inputParams.insert_state_data = this.blockResult.data;
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
      message: custom.lang('State added successfully.'),
      fields: [],
    };
    settingFields.fields = [
      'insert_id',
    ];

    const outputKeys = [
      'insert_state_data',
    ];
    const outputObjects = [
      'insert_state_data',
    ];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'state_add';

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
        name: 'state_add',
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
        name: 'state_add',
      },
    );
  }
}
