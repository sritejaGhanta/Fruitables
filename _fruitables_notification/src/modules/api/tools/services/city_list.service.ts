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


import { CityEntity } from 'src/entities/city.entity';
import { CountryEntity } from 'src/entities/country.entity';
import { StateEntity } from 'src/entities/state.entity';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class CityListService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    CityListService.name,
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
    @InjectRepository(CityEntity)
  protected cityEntityRepo: Repository<CityEntity>;
  
  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.multipleKeys = [
      'get_city_list',
    ];
  }

  /**
   * startCityList method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startCityList(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.getCityList(inputParams);
      if (!_.isEmpty(inputParams.get_city_list)) {
        outputResponse = this.finishSuccess(inputParams);
      } else {
        outputResponse = this.finishFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> city_list >>', err);
    }
    return outputResponse;
  }
  

  /**
   * getCityList method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getCityList(inputParams: any) {
    this.blockResult = {};
    try {
      const extraConfig = {
        table_name: 'mod_city',
        table_alias: 'mc',
        primary_key: 'id',
        request_obj: this.requestObj,
      };
      let pageIndex = 1;
      if ('page' in inputParams) {
        pageIndex = Number(inputParams.page);
      } else if ('page_index' in inputParams) {
        pageIndex = Number(inputParams.page_index);
      }
      pageIndex = pageIndex > 0 ? pageIndex : 1;
      const recLimit = Number(inputParams.limit);
      const startIdx = custom.getStartIndex(pageIndex, recLimit);

      let queryObject = this.cityEntityRepo.createQueryBuilder('mc');

      queryObject.leftJoin(CountryEntity, 'mc1', 'mc.id = mc1.id');
      queryObject.leftJoin(StateEntity, 'ms', 'mc.id = ms.id');
      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.andWhere('mc.city = :city', { city: inputParams.keyword });
      }
      //@ts-ignore;              
      this.getWhereClause(queryObject, inputParams, extraConfig);

      const totalCount = await queryObject.getCount();
      this.settingsParams = custom.getPagination(totalCount, pageIndex, recLimit);
      if (!totalCount) {
        throw new Error('No records found.');
      }

      queryObject = this.cityEntityRepo.createQueryBuilder('mc');

      queryObject.leftJoin(CountryEntity, 'mc1', 'mc.id = mc1.id');
      queryObject.leftJoin(StateEntity, 'ms', 'mc.id = ms.id');
      queryObject.select('mc.id', 'mc_id');
      queryObject.addSelect('mc.city', 'mc_city');
      queryObject.addSelect('mc.cityCode', 'mc_city_code');
      queryObject.addSelect('mc.countryId', 'mc_country_id');
      queryObject.addSelect('mc1.country', 'mc1_country');
      queryObject.addSelect('mc.stateId', 'mc_state_id');
      queryObject.addSelect('ms.state', 'ms_state');
      queryObject.addSelect('mc.status', 'mc_status');
      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.andWhere('mc.city = :city', { city: inputParams.keyword });
      }
      //@ts-ignore;              
      this.getWhereClause(queryObject, inputParams, extraConfig);
      //@ts-ignore;
      this.getOrderByClause(queryObject, inputParams, extraConfig);
      queryObject.offset(startIdx);
      queryObject.limit(recLimit);

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
    inputParams.get_city_list = this.blockResult.data;

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
      message: custom.lang('City list found.'),
      fields: [],
    };
    settingFields.fields = [
      'mc_id',
      'mc_city',
      'mc_city_code',
      'mc_country_id',
      'mc1_country',
      'mc_state_id',
      'ms_state',
      'mc_status',
    ];

    const outputKeys = [
      'get_city_list',
    ];
    const outputAliases = {
      mc_id: 'city_id',
      mc_city: 'city_name',
      mc_city_code: 'city_code',
      mc_country_id: 'country_id',
      mc1_country: 'country_name',
      mc_state_id: 'state_id',
      ms_state: 'state_name',
      mc_status: 'status',
    };

    const outputData: any = {};
    outputData.settings = { ...settingFields, ...this.settingsParams };
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'city_list';

    funcData.output_keys = outputKeys;
    funcData.output_alias = outputAliases;
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
      success: 1,
      message: custom.lang('City list not found.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'city_list',
      },
    );
  }
}
