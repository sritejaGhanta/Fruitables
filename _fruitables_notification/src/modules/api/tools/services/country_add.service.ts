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
import { BaseService } from 'src/services/base.service';

@Injectable()
export class CountryAddService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    CountryAddService.name,
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
  
  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.singleKeys = [
      'insert_country_data',
    ];
    this.multipleKeys = [
      'get_country_code_for_add',
    ];
  }

  /**
   * startCountryAdd method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startCountryAdd(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.getCountryCodeForAdd(inputParams);
      if (!_.isEmpty(inputParams.get_country_code_for_add)) {
        outputResponse = this.codeDuplicate(inputParams);
      } else {
      inputParams = await this.insertCountryData(inputParams);
      if (!_.isEmpty(inputParams.insert_country_data)) {
        outputResponse = this.finishSuccess(inputParams);
      } else {
        outputResponse = this.finishFailure(inputParams);
      }
      }
    } catch (err) {
      this.log.error('API Error >> country_add >>', err);
    }
    return outputResponse;
  }
  

  /**
   * getCountryCodeForAdd method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getCountryCodeForAdd(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.countryEntityRepo.createQueryBuilder('mc');

      queryObject.select('id', 'mc_id');
      if (!custom.isEmpty(inputParams.country_code)) {
        queryObject.andWhere('countryCode = :countryCode', { countryCode: inputParams.country_code });
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
    inputParams.get_country_code_for_add = this.blockResult.data;

    return inputParams;
  }

  /**
   * codeDuplicate method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  codeDuplicate(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 0,
      message: custom.lang('Country code already exists.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'country_add',
      },
    );
  }

  /**
   * insertCountryData method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async insertCountryData(inputParams: any) {
    this.blockResult = {};
    try {
      const queryColumns: any = {};
      if ('country_name' in inputParams) {
        queryColumns.country = inputParams.country_name;
      }
      if ('country_code' in inputParams) {
        queryColumns.countryCode = inputParams.country_code;
      }
      if ('country_code_iso3' in inputParams) {
        queryColumns.countryCodeISO3 = inputParams.country_code_iso3;
      }
      if ('dial_code' in inputParams) {
        queryColumns.dialCode = inputParams.dial_code;
      }
      if ('description' in inputParams) {
        queryColumns.description = inputParams.description;
      }
      if ('status' in inputParams) {
        queryColumns.status = inputParams.status;
      }
      const queryObject = this.countryEntityRepo;
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
    inputParams.insert_country_data = this.blockResult.data;
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
      message: custom.lang('Country added successfully.'),
      fields: [],
    };
    settingFields.fields = [
      'insert_id',
    ];

    const outputKeys = [
      'insert_country_data',
    ];
    const outputAliases = {
      insert_id: 'country_id',
    };
    const outputObjects = [
      'insert_country_data',
    ];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'country_add';

    funcData.output_keys = outputKeys;
    funcData.output_alias = outputAliases;
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
        name: 'country_add',
      },
    );
  }
}
