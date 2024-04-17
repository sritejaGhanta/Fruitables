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


import { ProductsEntity } from 'src/entities/products.entity';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class ProductsDeleteService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    ProductsDeleteService.name,
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
    @InjectRepository(ProductsEntity)
  protected productsEntityRepo: Repository<ProductsEntity>;
  
  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.singleKeys = [
      'delete_products_data',
    ];
  }

  /**
   * startProductsDelete method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startProductsDelete(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.deleteProductsData(inputParams);
      if (!_.isEmpty(inputParams.delete_products_data)) {
        outputResponse = this.productsDeleteFinishSuccess(inputParams);
      } else {
        outputResponse = this.productsDeleteFinishFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> products_delete >>', err);
    }
    return outputResponse;
  }
  

  /**
   * deleteProductsData method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async deleteProductsData(inputParams: any) {
    this.blockResult = {};
    try {      
                    
      const queryObject = this.productsEntityRepo
        .createQueryBuilder()
        .delete();
      if (!custom.isEmpty(inputParams.id)) {
        queryObject.andWhere('id = :id', { id: inputParams.id });
      }
      const res = await queryObject.execute();
      const data = {
        affected_rows: res.affected,
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
    inputParams.delete_products_data = this.blockResult.data;
    inputParams = this.response.assignSingleRecord(
      inputParams,
      this.blockResult.data,
    );

    return inputParams;
  }

  /**
   * productsDeleteFinishSuccess method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  productsDeleteFinishSuccess(inputParams: any) {
    const settingFields = {
      status: 200,
      success: 1,
      message: custom.lang('Products record deleted successfully.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'products_delete',
      },
    );
  }

  /**
   * productsDeleteFinishFailure method is used to process finish flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array response returns array of api response.
   */
  productsDeleteFinishFailure(inputParams: any) {
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
        name: 'products_delete',
      },
    );
  }
}
