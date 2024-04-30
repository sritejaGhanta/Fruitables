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
export class WishlistService extends BaseService {
  protected readonly log = new LoggerHandler(
    WishlistService.name,
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
    this.singleKeys = ['get_id', 'delete_wish_product', 'insert_wish_product'];
  }

  /**
   * startWishlist method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startWishlist(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;

      inputParams = await this.getId(inputParams);
      if (!_.isEmpty(inputParams.get_id)) {
        inputParams = await this.deleteWishProduct(inputParams);
      } else {
        inputParams = await this.insertWishProduct(inputParams);
      }
      outputResponse = this.finishSuccess(inputParams);
    } catch (err) {
      this.log.error('API Error >> wishlist >>', err);
    }
    return outputResponse;
  }

  /**
   * getId method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getId(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.wishlistEntityRepo.createQueryBuilder('w');

      queryObject.select('w.id', 'w_id');
      queryObject.andWhere('w.iUserId = :iUserId', {
        iUserId: this.requestObj.user.user_id,
      });
      if (!custom.isEmpty(inputParams.product_id)) {
        queryObject.andWhere('w.iProductId = :iProductId', {
          iProductId: inputParams.product_id,
        });
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
    inputParams.get_id = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * deleteWishProduct method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async deleteWishProduct(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.wishlistEntityRepo.createQueryBuilder().delete();
      if (!custom.isEmpty(inputParams.w_id)) {
        queryObject.andWhere('id = :id', { id: inputParams.w_id });
      }
      const res = await queryObject.execute();
      const data = {
        insert_id: res.affected,
      };

      const success = 1;
      const message = 'Record(s) deleted.';

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
    inputParams.delete_wish_product = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * insertWishProduct method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async insertWishProduct(inputParams: any) {
    this.blockResult = {};
    try {
      const queryColumns: any = {};
      if ('product_id' in inputParams) {
        queryColumns.iProductId = inputParams.product_id;
      }
      queryColumns.iUserId = this.requestObj.user.user_id;
      const queryObject = this.wishlistEntityRepo;
      const res = await queryObject.insert(queryColumns);
      const data = {
        insert_id1: res.raw.insertId,
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
    inputParams.insert_wish_product = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

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
      message: custom.lang('Wishlist data saved.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'wishlist',
      },
    );
  }
}
