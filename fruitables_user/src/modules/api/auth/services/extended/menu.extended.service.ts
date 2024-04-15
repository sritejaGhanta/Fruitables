import { Injectable } from '@nestjs/common';

import { MenuService } from '../menu.service';

@Injectable()
export class MenuExtendedService extends MenuService {

  getEmptyArray = () => [];
  // finishSuccess = inputParams => {
  //   let result = {};
  //   try {
  //     result = new MenuController().finishSuccess(inputParams);
  //   } catch (err){
  //     this.log.error(err);
  //   }

  //   const restrictAdminGroups = this.general.getConfigItem('restrict_admin_groups');
  //   if (_.isArray(restrictAdminGroups) && restrictAdminGroups.includes(inputParams.mgm_group_code)) {
  //     return result;
  //   }

  //   let capabilityList = [];
  //   try {
  //     capabilityList = JSON.parse(inputParams.mgm_group_capabilities);
  //   } catch (err){
  //     this.log.error(err);
  //   }

  //   if ('data' in result && _.isArray(result.data)) {
  //     const menuList = result.data;
  //     const newParentList = [];
  //     let newChildrenList = [];
  //     let capabilityCode;
  //     let childrenList;
  //     if (_.isArray(capabilityList) && capabilityList.length > 0) {
  //       menuList.forEach((dataObj) => {
  //         newChildrenList = [];
  //         childrenList = dataObj.subMenu;
  //         childrenList.forEach((childrenObj) => {
  //           capabilityCode = childrenObj.permission;
  //           if (capabilityList.includes(capabilityCode)) {
  //             newChildrenList.push(childrenObj);
  //           }
  //         });
        
  //         if (_.isArray(newChildrenList) && newChildrenList.length > 0) {
  //           newParentList.push({
  //             admin_menu_id: dataObj.admin_menu_id, 
  //             title: dataObj.title, 
  //             icon: dataObj.icon, 
  //             url: dataObj.url,
  //             permission: dataObj.permission,
  //             id: dataObj.id,
  //             collapsed: dataObj.collapsed,
  //             subMenu: newChildrenList
  //           })
  //         }
  //       });
  //     }
  //     result.data = newParentList;
  //   }
  //   return result;
  // }
}