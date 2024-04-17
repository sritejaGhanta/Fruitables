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
export class FaqListService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    FaqListService.name,
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
    @InjectRepository(FaqEntity)
  protected faqEntityRepo: Repository<FaqEntity>;
  
  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.multipleKeys = [
      'get_faq_list',
    ];
  }

  /**
   * startFaqList method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startFaqList(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.getFaqList(inputParams);
      if (!_.isEmpty(inputParams.get_faq_list)) {
        outputResponse = this.finishFaqListSuccess(inputParams);
      } else {
        outputResponse = this.finishFaqListFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> faq_list >>', err);
    }
    return outputResponse;
  }
  

  /**
   * getFaqList method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getFaqList(inputParams: any) {
    this.blockResult = {};
    try {
      let pageIndex = 1;
      if ('page' in inputParams) {
        pageIndex = Number(inputParams.page);
      } else if ('page_index' in inputParams) {
        pageIndex = Number(inputParams.page_index);
      }
      pageIndex = pageIndex > 0 ? pageIndex : 1;
      const recLimit = Number(inputParams.limit);
      const startIdx = custom.getStartIndex(pageIndex, recLimit);

      let queryObject = this.faqEntityRepo.createQueryBuilder('f');

      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.orWhere('f.vQuestionName LIKE :vQuestionName', { vQuestionName: `${inputParams.keyword}%` });
      }
      if (!custom.isEmpty(inputParams.product_id)) {
        queryObject.orWhere('f.iProductId = :iProductId', { iProductId: inputParams.product_id });
      }

      const totalCount = await queryObject.getCount();
      this.settingsParams = custom.getPagination(totalCount, pageIndex, recLimit);
      if (!totalCount) {
        throw new Error('No records found.');
      }

      queryObject = this.faqEntityRepo.createQueryBuilder('f');

      queryObject.select('f.id', 'f_id');
      queryObject.addSelect('f.iProductId', 'f_product_id');
      queryObject.addSelect('f.vQuestionName', 'f_question_name');
      queryObject.addSelect('f.vAnswer', 'f_answer');
      if (!custom.isEmpty(inputParams.keyword)) {
        queryObject.orWhere('f.vQuestionName LIKE :vQuestionName', { vQuestionName: `${inputParams.keyword}%` });
      }
      if (!custom.isEmpty(inputParams.product_id)) {
        queryObject.orWhere('f.iProductId = :iProductId', { iProductId: inputParams.product_id });
      }
      queryObject.addOrderBy('f.id', 'DESC');
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
    inputParams.get_faq_list = this.blockResult.data;

    return inputParams;
  }

  /**
   * finishFaqListSuccess method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  finishFaqListSuccess(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('Faq list found.'),
      fields: [],
    };
    settingFields.fields = [
      'f_id',
      'f_product_id',
      'f_question_name',
      'f_answer',
    ];

    const outputKeys = [
      'get_faq_list',
    ];
    const outputAliases = {
      f_id: 'id',
      f_product_id: 'product_id',
      f_question_name: 'question_name',
      f_answer: 'answer',
    };

    const outputData: any = {};
    outputData.settings = { ...settingFields, ...this.settingsParams };
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'faq_list';

    funcData.output_keys = outputKeys;
    funcData.output_alias = outputAliases;
    funcData.multiple_keys = this.multipleKeys;
    return this.response.outputResponse(outputData, funcData);
  }

  /**
   * finishFaqListFailure method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  finishFaqListFailure(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('No records found.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'faq_list',
      },
    );
  }
}
