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

import { WishlistEntity } from 'src/entities/wishlist.entity';
import { BaseService } from 'src/services/base.service';

import { rabbitmqProductConfig } from 'src/config/all-rabbitmq-core';
@Injectable()
export class WishlistListService extends BaseService {
  @Client({
    ...rabbitmqProductConfig,
    options: {
      ...rabbitmqProductConfig.options,
    },
  })
  rabbitmqRmqGetProductListClient: ClientProxy;

  protected readonly log = new LoggerHandler(
    WishlistListService.name,
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
  @InjectRepository(WishlistEntity)
  protected wishlistEntityRepo: Repository<WishlistEntity>;

  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.singleKeys = ['get_wishlist_list'];
    this.multipleKeys = ['external_api'];
  }

  /**
   * startWishlistList method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startWishlistList(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;

      inputParams = await this.getWishlistList(inputParams);
      if (!_.isEmpty(inputParams.get_wishlist_list)) {
        inputParams = await this.externalApi(inputParams);
        outputResponse = this.finishWishlistListSuccess(inputParams);
      } else {
        outputResponse = this.finishWishlistListFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> wishlist_list >>', err);
    }
    return outputResponse;
  }

  /**
   * getWishlistList method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getWishlistList(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.wishlistEntityRepo.createQueryBuilder('w');

      queryObject.select('JSON_ARRAYAGG(w.iProductId)', 'idss');
      queryObject.andWhere('w.iUserId = :iUserId', {
        iUserId: this.requestObj.user.user_id,
      });
      queryObject.addGroupBy('w.iUserId');

      const data: any = await queryObject.getRawOne();
      if (!_.isObject(data) || _.isEmpty(data)) {
        throw new Error('No records found.');
      }

      let val;
      if (_.isObject(data) && !_.isEmpty(data)) {
        const row: any = data;
        val = row.idss;
        //@ts-ignore;
        val = this.general.parse(val, row, {
          field: 'idss',
          params: inputParams,
          request: this.requestObj,
        });
        data['idss'] = val;
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
    inputParams.get_wishlist_list = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

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
      ids: inputParams.idss,
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
   * finishWishlistListSuccess method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  finishWishlistListSuccess(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('Wishlist list found.'),
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
    const outputAliases = {
      id: 'product_id',
    };

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'wishlist_list';

    funcData.output_keys = outputKeys;
    funcData.output_alias = outputAliases;
    funcData.single_keys = this.singleKeys;
    funcData.multiple_keys = this.multipleKeys;
    return this.response.outputResponse(outputData, funcData);
  }

  /**
   * finishWishlistListFailure method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  finishWishlistListFailure(inputParams: any) {
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
        name: 'wishlist_list',
      },
    );
  }
}
