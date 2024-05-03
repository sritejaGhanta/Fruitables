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


import { AdminMenuEntity } from 'src/entities/admin-menu.entity';
import { AdminEntity } from 'src/entities/admin.entity';
import { GroupMasterEntity } from 'src/entities/group-master.entity';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class MenuService extends BaseService {
  
  
  protected readonly log = new LoggerHandler(
    MenuService.name,
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
    @InjectRepository(AdminMenuEntity)
  protected adminMenuEntityRepo: Repository<AdminMenuEntity>;
    @InjectRepository(AdminEntity)
  protected adminEntityRepo: Repository<AdminEntity>;
  
  /**
   * constructor method is used to set preferences while service object initialization.
   */
  constructor() {
    super();
    this.singleKeys = [
      'get_admin_group_details',
    ];
    this.multipleKeys = [
      'get_parent_menu',
    ];
  }

  /**
   * startMenu method is used to initiate api execution flow.
   * @param array reqObject object is used for input request.
   * @param array reqParams array is used for input params.
   * @param array reqFiles array is used for post files.
   * @return array outputResponse returns output response of API.
   */
  async startMenu(reqObject, reqParams) {
    let outputResponse = {};

    try {
      this.requestObj = reqObject;
      this.inputParams = reqParams;
      let inputParams = reqParams;


      inputParams = await this.getParentMenu(inputParams);
      if (!_.isEmpty(inputParams.get_parent_menu)) {
        inputParams = await this.startParentLoop(inputParams);
      inputParams = await this.getAdminGroupDetails(inputParams);
        outputResponse = this.finishSuccess(inputParams);
      } else {
        outputResponse = this.finishFailure(inputParams);
      }
    } catch (err) {
      this.log.error('API Error >> menu >>', err);
    }
    return outputResponse;
  }
  

  /**
   * getParentMenu method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getParentMenu(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.adminMenuEntityRepo.createQueryBuilder('mam');

      queryObject.select('id', 'mam_id');
      queryObject.addSelect('menuDisplay', 'mam_menu_display');
      queryObject.addSelect('icon', 'mam_icon');
      queryObject.addSelect('url', 'mam_url');
      queryObject.addSelect('capabilityCode', 'mam_capability_code');
      queryObject.addSelect('uniqueMenuCode', 'mam_unique_menu_code');
      queryObject.addSelect("'true'", 'parent_collapsed');
      queryObject.andWhere('parentId = :parentId', { parentId: '0' });
      queryObject.andWhere('status IN (:...status)', { status :['Active'] });
      queryObject.addOrderBy('sequenceOrder', 'ASC');

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
    inputParams.get_parent_menu = this.blockResult.data;

    return inputParams;
  }

  /**
   * startParentLoop method is used to process loop flow.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async startParentLoop(inputParams: any) {
    inputParams.get_parent_menu = await this.iterateStartParentLoop(inputParams.get_parent_menu, inputParams);
    return inputParams;
  }


  /**
   * getChildrenMenu method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getChildrenMenu(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.adminMenuEntityRepo.createQueryBuilder('mam');

      queryObject.select('id', 'mam_id_1');
      queryObject.addSelect('menuDisplay', 'mam_menu_display_1');
      queryObject.addSelect('icon', 'mam_icon_1');
      queryObject.addSelect('url', 'mam_url_1');
      queryObject.addSelect('open', 'mam_open');
      queryObject.addSelect('capabilityCode', 'mam_capability_code_1');
      queryObject.addSelect('uniqueMenuCode', 'mam_unique_menu_code_1');
      queryObject.addSelect("'true'", 'child_collapsed');
      queryObject.addSelect("'true'", 'is_child_item');
      queryObject.addSelect("''", 'sub_menu');
      if (!custom.isEmpty(inputParams.mam_id)) {
        queryObject.andWhere('parentId = :parentId', { parentId: inputParams.mam_id });
      }
      queryObject.andWhere('status IN (:...status)', { status :['Active'] });

      const data = await queryObject.getRawMany();
      if (!_.isArray(data) || _.isEmpty(data)) {
        throw new Error('No records found.');
      }

      let val;
      if (_.isArray(data) && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          val = row.sub_menu;
          //@ts-ignore;
          val = this.getEmptyArray(val, row, {
            index: i,
            field: 'sub_menu',
            params: inputParams,
            request: this.requestObj,
          });
          data[i].sub_menu = val;
        }
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
    inputParams.get_children_menu = this.blockResult.data;

    return inputParams;
  }

  /**
   * getAdminGroupDetails method is used to process query block.
   * @param array inputParams inputParams array to process loop flow.
   * @return array inputParams returns modfied input_params array.
   */
  async getAdminGroupDetails(inputParams: any) {
    this.blockResult = {};
    try {
      const queryObject = this.adminEntityRepo.createQueryBuilder('ma');

      queryObject.leftJoin(GroupMasterEntity, 'mgm', 'ma.groupId = mgm.id');
      queryObject.select('mgm.groupCode', 'mgm_group_code');
      queryObject.addSelect('mgm.groupCapabilities', 'mgm_group_capabilities');
      queryObject.andWhere('ma.id = :id', { id: this.requestObj.user.id });

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
    inputParams.get_admin_group_details = this.blockResult.data;
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
      message: custom.lang('Menu found.'),
      fields: [],
    };
    settingFields.fields = [
      'mam_id',
      'mam_menu_display',
      'mam_icon',
      'mam_url',
      'mam_capability_code',
      'mam_unique_menu_code',
      'parent_collapsed',
      'get_children_menu',
      'mam_id_1',
      'mam_menu_display_1',
      'mam_icon_1',
      'mam_url_1',
      'mam_open',
      'mam_capability_code_1',
      'mam_unique_menu_code_1',
      'child_collapsed',
      'is_child_item',
      'sub_menu',
    ];

    const outputKeys = [
      'get_parent_menu',
    ];
    const outputAliases = {
      mam_id: 'admin_menu_id',
      mam_menu_display: 'title',
      mam_icon: 'icon',
      mam_url: 'routerLink',
      mam_capability_code: 'permission',
      mam_unique_menu_code: 'id',
      parent_collapsed: 'collapsed',
      get_children_menu: 'subMenu',
      mam_id_1: 'admin_menu_id',
      mam_menu_display_1: 'title',
      mam_icon_1: 'icon',
      mam_url_1: 'routerLink',
      mam_open: 'openIn',
      mam_capability_code_1: 'permission',
      mam_unique_menu_code_1: 'id',
      child_collapsed: 'collapsed',
      is_child_item: 'isChildItem',
      sub_menu: 'subMenu',
    };
    const innerKeys = [
      'get_children_menu',
    ];

    const outputData: any = {};
    outputData.settings = settingFields;
    outputData.data = inputParams;

    const funcData: any = {};
    funcData.name = 'menu';

    funcData.output_keys = outputKeys;
    funcData.output_alias = outputAliases;
    funcData.inner_keys = innerKeys;
    funcData.single_keys = this.singleKeys;
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
      message: custom.lang('No  menu found.'),
      fields: [],
    };
    return this.response.outputResponse(
      {
        settings: settingFields,
        data: inputParams,
      },
      {
        name: 'menu',
      },
    );
  }

  /**
   * iterateStartParentLoop method is used to iterate loop.
   * @param array itrLoopData itrLoopData array to iterate loop.
   * @param array inputData inputData array to address original input params.
   */
  async iterateStartParentLoop(itrLoopData, inputData) {
    itrLoopData = _.isArray(itrLoopData) ? [...itrLoopData] : [];
    const loopDataObject = [...itrLoopData];
    const inputDataLocal = { ...inputData };
    let dictObjects = {};
    let eachLoopObj:any = {};
    let inputParams = {};

    const ini = 0;
    const end = loopDataObject.length;
    for (let i = ini; i < end; i += 1) {
      eachLoopObj = inputDataLocal;

      delete eachLoopObj.get_parent_menu;
      if (_.isObject(loopDataObject[i])) {
        eachLoopObj = { ...inputDataLocal, ...loopDataObject[i] };
      } else {
        eachLoopObj.get_parent_menu = loopDataObject[i];
        loopDataObject[i] = [];
        loopDataObject[i].get_parent_menu = eachLoopObj.get_parent_menu;
      }

      eachLoopObj.i = i;
      inputParams = { ...eachLoopObj };

      inputParams = await this.getChildrenMenu(inputParams);

      itrLoopData[i] = this.response.filterLoopParams(inputParams, loopDataObject[i], eachLoopObj);
    }
    return itrLoopData;
  }
}
