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
import { CountryEntity } from 'src/entities/country.entity';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class StateListService extends BaseService {
  protected readonly log = new LoggerHandler(
    StateListService.name,
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
  @InjectRepository(StateEntity)
  protected stateEntityRepo: Repository<StateEntity>;

  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.multipleKeys = ['get_state_list'];
  }

  /**
   * startStateList method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startStateList(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;

      inputParams = await this.getStateList(inputParams);
      if (!_.isEmpty(inputParams.get_state_list)) {
        outputResponse = this.finishSuccess(inputParams);
      } else {
        outputResponse = this.finishFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> state_list >>', err);
    }
    return outputResponse;
  }

  /**
   * getStateList method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getStateList(inputParams: any) {
    this.blockResult = {};
    try {
      const extraConfig = {
        table_name: 'mod_state',
        table_alias: 'ms',
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

      let queryObject = this.stateEntityRepo.createQueryBuilder('ms');

      queryObject.leftJoin(CountryEntity, 'mc', 'ms.countryId = mc.id');
      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.andWhere('ms.state LIKE :state', {
          state: `%${inputParams.keyword}%`,
        });
      }
      if (!custom.isEmpty(inputParams.country_id)) {
        queryObject.andWhere('ms.countryId = :countryId', {
          countryId: inputParams.country_id,
        });
      }

      const totalCount = await queryObject.getCount();
      this.settingsParams = custom.getPagination(
        totalCount,
        pageIndex,
        recLimit,
      );
      if (!totalCount) {
        throw new Error('No records found.');
      }

      queryObject = this.stateEntityRepo.createQueryBuilder('ms');

      queryObject.leftJoin(CountryEntity, 'mc', 'ms.countryId = mc.id');
      queryObject.select('ms.id', 'ms_id');
      queryObject.addSelect('ms.state', 'ms_state');
      queryObject.addSelect('ms.stateCode', 'ms_state_code');
      queryObject.addSelect('ms.countryId', 'ms_country_id');
      queryObject.addSelect('mc.country', 'mc_country');
      queryObject.addSelect('mc.countryCode', 'mc_country_code');
      queryObject.addSelect('ms.status', 'ms_status');
      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.andWhere('ms.state LIKE :state', {
          state: `%${inputParams.keyword}%`,
        });
      }
      if (!custom.isEmpty(inputParams.country_id)) {
        queryObject.andWhere('ms.countryId = :countryId', {
          countryId: inputParams.country_id,
        });
      }
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
    inputParams.get_state_list = this.blockResult.data;

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
      message: custom.lang('State list found.'),
      fields: [],
    };
    settingFields.fields = [
      'ms_id',
      'ms_state',
      'ms_state_code',
      'ms_country_id',
      'mc_country',
      'mc_country_code',
      'ms_status',
    ];

    const outputKeys = ['get_state_list'];
    const outputAliases = {
      ms_id: 'state_id',
      ms_state: 'state_name',
      ms_state_code: 'state_code',
      ms_country_id: 'country_id',
      mc_country: 'country_name',
      mc_country_code: 'country_code',
      ms_status: 'status',
    };

    const outputData: any = {};
    outputData.settings = { ...settingFields, ...this.settingsParams };
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'state_list';

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
      message: custom.lang('State list not found.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'state_list',
      },
    );
  }
}
