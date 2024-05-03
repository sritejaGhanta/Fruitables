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
export class GetCountryDialCodesService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    GetCountryDialCodesService.name,
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
    @InjectRepository(CountryEntity)
  protected countryEntityRepo: Repository<CountryEntity>;
  
  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.multipleKeys = [
      'get_country_dail_codes_list_1',
    ];
  }

  /**
   * startGetCountryDialCodes method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startGetCountryDialCodes(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.getCountryDailCodesList1(inputParams);
      if (!_.isEmpty(inputParams.get_country_dail_codes_list_1)) {
        outputResponse = this.finishSuccess(inputParams);
      } else {
        outputResponse = this.finishFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> get_country_dial_codes >>', err);
    }
    return outputResponse;
  }
  

  /**
   * getCountryDailCodesList1 method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getCountryDailCodesList1(inputParams: any) {
    this.blockResult = {};
    try {
      const extraConfig = {
        table_name: 'mod_country',
        table_alias: 'mc',
        primary_key: 'id',
        request_obj: this.requestObj,
      };
      const queryObject = this.countryEntityRepo.createQueryBuilder('mc');

      queryObject.select('mc.country', 'mc_country');
      queryObject.addSelect('mc.dialCode', 'mc_dial_code');
      //@ts-ignore;              
      this.getWhereClause(queryObject, inputParams, extraConfig);
      queryObject.addOrderBy('mc.country', 'ASC');

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
    inputParams.get_country_dail_codes_list_1 = this.blockResult.data;

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
      message: custom.lang('Country dial codes found.'),
      fields: [],
    };
    settingFields.fields = [
      'mc_country',
      'mc_dial_code',
    ];

    const outputKeys = [
      'get_country_dail_codes_list_1',
    ];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'get_country_dial_codes';

    funcData.output_keys = outputKeys;
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
      message: custom.lang('Country dial codes not found.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'get_country_dial_codes',
      },
    );
  }
}
