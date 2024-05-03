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


import { ContactUsEntity } from 'src/entities/contact-us.entity';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class UserContactUsService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    UserContactUsService.name,
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
    @InjectRepository(ContactUsEntity)
  protected contactUsEntityRepo: Repository<ContactUsEntity>;
  
  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.singleKeys = [
      'get_user_contact',
      'update_contact_us',
      'insert_contact_us',
    ];
  }

  /**
   * startUserContactUs method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startUserContactUs(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.getUserContact(inputParams);
      if (!_.isEmpty(inputParams.get_user_contact)) {
      inputParams = await this.updateContactUs(inputParams);
      } else {
      inputParams = await this.insertContactUs(inputParams);
      }
        outputResponse = this.contactUsFinishSuccess(inputParams);
    } catch (err) {
      this.log.error('API Error >> user_contact_us >>', err);
    }
    return outputResponse;
  }
  

  /**
   * getUserContact method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getUserContact(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.contactUsEntityRepo.createQueryBuilder('cu');

      queryObject.select('cu.id', 'cu_id');
      queryObject.addSelect('cu.iCount', 'cu_count');
      if (!custom.isEmpty(inputParams.email)) {
        queryObject.andWhere('cu.vEmail = :vEmail', { vEmail: inputParams.email });
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
    inputParams.get_user_contact = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * updateContactUs method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async updateContactUs(inputParams: any) {
    this.blockResult = {};
    try {                
      

      const queryColumns: any = {};
      if ('name' in inputParams) {
        queryColumns.vName = inputParams.name;
      }
      if ('email' in inputParams) {
        queryColumns.vEmail = inputParams.email;
      }
      if ('message' in inputParams) {
        queryColumns.vMessage = inputParams.message;
      }
      queryColumns.iCount = () => 'iCount + 1';

      const queryObject = this.contactUsEntityRepo
        .createQueryBuilder()
        .update(ContactUsEntity)
        .set(queryColumns);
      if (!custom.isEmpty(inputParams.cu_id)) {
        queryObject.andWhere('id = :id', { id: inputParams.cu_id });
      }
      if (!custom.isEmpty(inputParams.email)) {
        queryObject.andWhere('vEmail = :vEmail', { vEmail: inputParams.email });
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
    inputParams.update_contact_us = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * insertContactUs method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async insertContactUs(inputParams: any) {
    this.blockResult = {};
    try {
      const queryColumns: any = {};
      if ('name' in inputParams) {
        queryColumns.vName = inputParams.name;
      }
      if ('email' in inputParams) {
        queryColumns.vEmail = inputParams.email;
      }
      if ('message' in inputParams) {
        queryColumns.vMessage = inputParams.message;
      }
      queryColumns.iCount = () => '1';
      const queryObject = this.contactUsEntityRepo;
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
    inputParams.insert_contact_us = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * contactUsFinishSuccess method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  contactUsFinishSuccess(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('We received your message. My team will contact you as soon as possible.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'user_contact_us',
      },
    );
  }
}
