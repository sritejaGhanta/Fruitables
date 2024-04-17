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


import { FaqEntity } from 'src/entities/faq.entity';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class FaqAddService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    FaqAddService.name,
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
    @InjectRepository(FaqEntity)
  protected faqEntityRepo: Repository<FaqEntity>;
  
  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.singleKeys = [
      'insert_faq_data',
    ];
  }

  /**
   * startFaqAdd method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startFaqAdd(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.insertFaqData(inputParams);
      if (!_.isEmpty(inputParams.insert_faq_data)) {
        outputResponse = this.faqAddFinishSuccess(inputParams);
      } else {
        outputResponse = this.faqAddFinishFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> faq_add >>', err);
    }
    return outputResponse;
  }
  

  /**
   * insertFaqData method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async insertFaqData(inputParams: any) {
    this.blockResult = {};
    try {
      const queryColumns: any = {};
      if ('product_id' in inputParams) {
        queryColumns.iProductId = inputParams.product_id;
      }
      if ('question_name' in inputParams) {
        queryColumns.vQuestionName = inputParams.question_name;
      }
      if ('answer' in inputParams) {
        queryColumns.vAnswer = inputParams.answer;
      }
      const queryObject = this.faqEntityRepo;
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
    inputParams.insert_faq_data = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * faqAddFinishSuccess method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  faqAddFinishSuccess(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('Faq added successfully.'),
      fields: [],
    };
    settingFields.fields = [
      'insert_id',
    ];

    const outputKeys = [
      'insert_faq_data',
    ];
    const outputObjects = [
      'insert_faq_data',
    ];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'faq_add';

    funcData.output_keys = outputKeys;
    funcData.output_objects = outputObjects;
    funcData.single_keys = this.singleKeys;
    return this.response.outputResponse(outputData, funcData);
  }

  /**
   * faqAddFinishFailure method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  faqAddFinishFailure(inputParams: any) {
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
        name: 'faq_add',
      },
    );
  }
}
