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


import { UserEntity } from 'src/entities/user.entity';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class UserAutocompleteService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    UserAutocompleteService.name,
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
    @InjectRepository(UserEntity)
  protected userEntityRepo: Repository<UserEntity>;
  
  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.multipleKeys = [
      'get_user_results',
    ];
  }

  /**
   * startUserAutocomplete method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startUserAutocomplete(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.getUserResults(inputParams);
      if (!_.isEmpty(inputParams.get_user_results)) {
        outputResponse = this.userAutocompleteFinishSuccess(inputParams);
      } else {
        outputResponse = this.userAutocompleteFinishFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> user_autocomplete >>', err);
    }
    return outputResponse;
  }
  

  /**
   * getUserResults method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getUserResults(inputParams: any) {
    this.blockResult = {};
    try {
      let pageIndex = 1;
      if ('page' in inputParams) {
        pageIndex = Number(inputParams.page);
      } else if ('page_index' in inputParams) {
        pageIndex = Number(inputParams.page_index);
      }
      pageIndex = pageIndex > 0 ? pageIndex : 1;
      const recLimit = 500;
      const startIdx = custom.getStartIndex(pageIndex, recLimit);

      let queryObject = this.userEntityRepo.createQueryBuilder('u');

      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.andWhere('u.vFirstName LIKE :vFirstName', { vFirstName: `${inputParams.keyword}%` });
      }
      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.andWhere('u.vLastName LIKE :vLastName', { vLastName: `${inputParams.keyword}%` });
      }
      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.andWhere('u.vEmail LIKE :vEmail', { vEmail: `${inputParams.keyword}%` });
      }
      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.andWhere('u.eStatus = :eStatus', { eStatus: inputParams.keyword });
      }
      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.andWhere('u.vPhoneNumber LIKE :vPhoneNumber', { vPhoneNumber: `${inputParams.keyword}%` });
      }
      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.andWhere('u.vDialCode LIKE :vDialCode', { vDialCode: `${inputParams.keyword}%` });
      }

      const totalCount = await queryObject.getCount();
      this.settingsParams = custom.getPagination(totalCount, pageIndex, recLimit);
      if (!totalCount) {
        throw new Error('No records found.');
      }

      queryObject = this.userEntityRepo.createQueryBuilder('u');

      queryObject.select('u.iUserId', 'user_id');
      queryObject.addSelect('CONCAT_WS(\' \', u.vFirstName, u.vLastName)', 'user_name');
      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.andWhere('u.vFirstName LIKE :vFirstName', { vFirstName: `${inputParams.keyword}%` });
      }
      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.andWhere('u.vLastName LIKE :vLastName', { vLastName: `${inputParams.keyword}%` });
      }
      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.andWhere('u.vEmail LIKE :vEmail', { vEmail: `${inputParams.keyword}%` });
      }
      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.andWhere('u.eStatus = :eStatus', { eStatus: inputParams.keyword });
      }
      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.andWhere('u.vPhoneNumber LIKE :vPhoneNumber', { vPhoneNumber: `${inputParams.keyword}%` });
      }
      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.andWhere('u.vDialCode LIKE :vDialCode', { vDialCode: `${inputParams.keyword}%` });
      }
      queryObject.addOrderBy('u.vFirstName', 'ASC');
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
    inputParams.get_user_results = this.blockResult.data;

    return inputParams;
  }

  /**
   * userAutocompleteFinishSuccess method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  userAutocompleteFinishSuccess(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('User results found.'),
      fields: [],
    };
    settingFields.fields = [
      'user_id',
      'user_name',
    ];

    const outputKeys = [
      'get_user_results',
    ];

    const outputData: any = {};
    outputData.settings = { ...settingFields, ...this.settingsParams };
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'user_autocomplete';

    funcData.output_keys = outputKeys;
    funcData.multiple_keys = this.multipleKeys;
    return this.response.outputResponse(outputData, funcData);
  }

  /**
   * userAutocompleteFinishFailure method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  userAutocompleteFinishFailure(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('user results not found.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'user_autocomplete',
      },
    );
  }
}
