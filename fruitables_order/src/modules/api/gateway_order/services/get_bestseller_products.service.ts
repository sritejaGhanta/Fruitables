interface AuthObject {
  user: any;
}
import { Inject, Injectable, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Client, ClientProxy } from '@nestjs/microservices';

import * as _ from 'lodash';
import * as custom from 'src/utilities/custom-helper';
import { LoggerHandler } from 'src/utilities/logger-handler';
import { BlockResultDto, SettingsParamsDto } from 'src/common/dto/common.dto';

import { ResponseLibrary } from 'src/utilities/response-library';
import { CitGeneralLibrary } from 'src/utilities/cit-general-library';
import { ResponseHandlerInterface } from 'src/utilities/response-handler';

import { OrderItemEntity } from 'src/entities/order-item.entity';
import { BaseService } from 'src/services/base.service';

import { rabbitmqProductConfig } from 'src/config/all-rabbitmq-core';
@Injectable()
export class GetBestsellerProductsService extends BaseService {
  @Client({
    ...rabbitmqProductConfig,
    options: {
      ...rabbitmqProductConfig.options,
    },
  })
  rabbitmqRmqGetProductListClient: ClientProxy;

  protected readonly log = new LoggerHandler(
    GetBestsellerProductsService.name,
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
  @InjectRepository(OrderItemEntity)
  protected orderItemEntityRepo: Repository<OrderItemEntity>;

  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.multipleKeys = ['get_ids', 'prepare_ids', 'external_api'];
  }

  /**
   * startGetBestsellerProducts method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startGetBestsellerProducts(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;

      inputParams = await this.getIds(inputParams);
      if (!_.isEmpty(inputParams.get_ids)) {
        inputParams = await this.prepareIds(inputParams);
        inputParams = await this.externalApi(inputParams);
        outputResponse = this.orderItemFinishSuccess(inputParams);
      } else {
        outputResponse = this.finishFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> get_bestseller_products >>', err);
    }
    return outputResponse;
  }

  /**
   * getIds method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getIds(inputParams: any) {
    this.blockResult = {};
    try {
      const extraConfig = {
        table_name: 'order_item',
        table_alias: 'oi',
        primary_key: 'id',
        request_obj: this.requestObj,
      };
      const queryObject = this.orderItemEntityRepo.createQueryBuilder('oi');

      queryObject.select('oi.iProductId', 'product_id');
      queryObject.addGroupBy('oi.iProductId');
      //@ts-ignore;
      this.addOrderBy(queryObject, inputParams, extraConfig);
      queryObject.limit(8);
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
    inputParams.get_ids = this.blockResult.data;

    return inputParams;
  }

  /**
   * prepareIds method is used to process custom function.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async prepareIds(inputParams: any) {
    let formatData: any = {};
    try {
      //@ts-ignore
      const result = await this.prepare(inputParams);

      formatData = this.response.assignFunctionResponse(result);
      inputParams.prepare_ids = formatData;

      inputParams = this.response.assignSingleRecord(inputParams, formatData);
    } catch (err) {
      this.log.error(err);
    }
    return inputParams;
  }

  /**
   * externalApi method is used to process external API flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async externalApi(inputParams: any) {
    this.blockResult = {};
    let apiResult: ResponseHandlerInterface = {};
    let apiInfo = {};
    let success;
    let message;

    const extInputParams: any = {
      ids: inputParams.ids,
    };

    try {
      console.log('emiting from here rabbitmq!');
      apiResult = await new Promise<any>((resolve, reject) => {
        this.rabbitmqRmqGetProductListClient
          .send('rmq_get_product_list', extInputParams)
          .pipe()
          .subscribe((data: any) => {
            resolve(data);
          });
      });

      if (!apiResult?.settings?.success) {
        throw new Error(apiResult?.settings?.message);
      }
      this.blockResult.data = apiResult.data;

      success = apiResult.settings.success;
      message = apiResult.settings.message;
    } catch (err) {
      success = 0;
      message = err;
    }

    this.blockResult.success = success;
    this.blockResult.message = message;

    inputParams.external_api = apiResult.settings.success ? apiResult.data : [];
    inputParams = this.response.assignSingleRecord(inputParams, apiResult.data);

    if (_.isObject(apiInfo) && !_.isEmpty(apiInfo)) {
      Object.keys(apiInfo).forEach((key) => {
        const infoKey = `' . external_api . '_0`;
        inputParams[infoKey] = apiInfo[key];
      });
    }

    return inputParams;
  }

  /**
   * orderItemFinishSuccess method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  orderItemFinishSuccess(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('List found'),
      fields: [],
    };
    settingFields.fields = [
      'get_product_lists',
      'product_category_id',
      'product_name',
      'product_image',
      'product_cost',
      'product_description',
      'rating',
      'status',
      'offer_type',
      'category_name',
      'product_image_name',
      'id',
    ];

    const outputKeys = ['external_api'];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'get_bestseller_products';

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
      message: custom.lang('Data not found.'),
      fields: [],
    };
    settingFields.fields = ['product_id'];

    const outputKeys = ['get_ids'];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'get_bestseller_products';

    funcData.output_keys = outputKeys;
    funcData.multiple_keys = this.multipleKeys;
    return this.response.outputResponse(outputData, funcData);
  }
}
