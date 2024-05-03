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

import { WishlistEntity } from 'src/entities/wishlist.entity';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class WishlistDetailsService extends BaseService {
  protected readonly log = new LoggerHandler(
    WishlistDetailsService.name,
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
  @InjectRepository(WishlistEntity)
  protected wishlistEntityRepo: Repository<WishlistEntity>;

  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.singleKeys = ['get_wishlist_details'];
  }

  /**
   * startWishlistDetails method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startWishlistDetails(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;

      inputParams = await this.getWishlistDetails(inputParams);
      if (!_.isEmpty(inputParams.get_wishlist_details)) {
        outputResponse = this.wishlistDetailsFinishSuccess(inputParams);
      } else {
        outputResponse = this.wishlistDetailsFinishFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> wishlist_details >>', err);
    }
    return outputResponse;
  }

  /**
   * getWishlistDetails method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getWishlistDetails(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.wishlistEntityRepo.createQueryBuilder('w');

      queryObject.select('JSON_ARRAYAGG(w.iProductId)', 'product_ids');
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
        val = row.product_ids;
        //@ts-ignore;
        val = this.general.parse(val, row, {
          field: 'product_ids',
          params: inputParams,
          request: this.requestObj,
        });
        data['product_ids'] = val;
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
    inputParams.get_wishlist_details = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * wishlistDetailsFinishSuccess method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  wishlistDetailsFinishSuccess(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('Wishlist details found.'),
      fields: [],
    };
    settingFields.fields = ['product_ids'];

    const outputKeys = ['get_wishlist_details'];
    const outputObjects = ['get_wishlist_details'];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'wishlist_details';

    funcData.output_keys = outputKeys;
    funcData.output_objects = outputObjects;
    funcData.single_keys = this.singleKeys;
    return this.response.outputResponse(outputData, funcData);
  }

  /**
   * wishlistDetailsFinishFailure method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  wishlistDetailsFinishFailure(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 0,
      message: custom.lang('wishlist details not found.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'wishlist_details',
      },
    );
  }
}
