import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, EntityManager, Repository, UpdateResult } from 'typeorm';

import * as _ from 'lodash';
import * as custom from '../utilities/custom-helper';
import { LoggerHandler } from 'src/utilities/logger-handler';
import { CitGeneralLibrary } from '../utilities/cit-general-library';

import { CacheService } from './cache.service';

import moduleConfig from '../config/cit-modules';

import {
  FormConfigFieldInterface,
  ModuleServiceObjectInterface,
} from 'src/common/interface/common.interface';
import { SettingEntity } from 'src/entities/setting.entity';
import { ResponseHandler } from 'src/utilities/response-handler';

@Injectable()
export class ModuleService {
  protected readonly log = new LoggerHandler().getInstance();

  constructor(
    protected readonly entityManager: EntityManager,
    protected readonly configService: ConfigService,
    protected readonly cacheService: CacheService,
    protected readonly general: CitGeneralLibrary,
    @InjectRepository(SettingEntity)
    protected settingEntityRepo: Repository<SettingEntity>,
  ) { }

  getListFilterClause(queryObject: any, filterParams: any, filterConfig: any) {
    let { filters } = filterParams;
    const { keyword } = filterParams;

    const serviceConfig = filterConfig.service_config;
    const listConfig = filterConfig.list_config;
    const formConfig = filterConfig.form_config;
    const multipleCtrls = ['multi_select_dropdown', 'checkboxes'];
    const nullOperators = ['empty', 'notempty'];

    if (typeof filters === 'string') {
      try {
        filters = JSON.parse(filters);
      } catch (err) {
        filters = [];
      }
    }

    const searchFilters: any = [];
    if (_.isArray(filters) && filters.length > 0) {
      for (const item of filters) {
        if (_.isArray(item.value)) {
          if (item.operator == 'notin' || item.operator == 'notcontain') {
            searchFilters.push({
              alias: item.key,
              value: item.value,
              condition: 'notin',
            });
          } else {
            searchFilters.push({
              alias: item.key,
              value: item.value,
              condition: 'range',
            });
          }
        } else if (item.operator) {
          searchFilters.push({
            alias: item.key,
            value: item.value,
            condition: item.operator,
          });
        } else {
          searchFilters.push({
            alias: item.key,
            value: item.value,
            condition: 'begin',
          });
        }
      }
    }

    if (
      (_.isArray(searchFilters) && searchFilters.length) ||
      !custom.isEmpty(keyword)
    ) {
      const brackets = new Brackets((qb) => {
        if (_.isArray(searchFilters) && searchFilters.length) {
          let searchFiltersObject = {};
          for (const item of searchFilters) {
            const aliasName = item.alias;
            const searchVal: any = item.value;
            const operator = item.condition;

            if (!(aliasName in listConfig)) {
              return;
            }

            const fieldConfig = listConfig[aliasName];
            let displayQuery = fieldConfig.display_query;
            let sourceConfig: any = {};
            let havingMulti = null;
            let rawQuery = null;

            if (fieldConfig.entry_type === 'Custom') {
              rawQuery = true;
            } else {
              if (serviceConfig.table_alias === fieldConfig.table_alias) {
                sourceConfig = formConfig[fieldConfig.form_field];
              } else if (fieldConfig.form_field in formConfig) {
                sourceConfig = formConfig[fieldConfig.form_field];
                if (['in', 'range', 'notin'].includes(operator)) {
                  displayQuery = `${sourceConfig.table_alias}.${sourceConfig.field_name}`;
                }
              }
              // else {
              //   displayQuery = `${listConfig.table_alias}.${listConfig.field_name}`;
              // }
            }
            if (fieldConfig.sql_func) {
              displayQuery = this.processSQLFunction(
                fieldConfig.sql_func,
                displayQuery,
              );
              rawQuery = true;
            } else {
              rawQuery = false;
            }
            if (
              multipleCtrls.includes(fieldConfig.type) ||
              (fieldConfig.type === 'autocomplete' && sourceConfig.multiple)
            ) {
              havingMulti = true;
            }

            if (
              custom.isEmpty(searchVal) &&
              !nullOperators.includes(operator)
            ) {
              return;
            }
            if (aliasName in searchFiltersObject) {
              searchFiltersObject[aliasName] += 1;
            } else {
              searchFiltersObject[aliasName] = 0;
            }
            let whereString: string = '';
            let paramObj: object = {};
            switch (operator) {
              case 'notequal':
                whereString = `${displayQuery} <> :${`${aliasName}_${searchFiltersObject[aliasName]}`}`;

                paramObj = {
                  [`${aliasName}_${searchFiltersObject[aliasName]}`]: searchVal,
                };

                break;
              case 'less':
                whereString = `${displayQuery} < :${`${aliasName}_${searchFiltersObject[aliasName]}`}`;

                paramObj = {
                  [`${aliasName}_${searchFiltersObject[aliasName]}`]: searchVal,
                };

                break;
              case 'lte':
                whereString = `${displayQuery} <= :${`${aliasName}_${searchFiltersObject[aliasName]}`}`;
                paramObj = {
                  [`${aliasName}_${searchFiltersObject[aliasName]}`]: searchVal,
                };

                break;
              case 'greater':
                whereString = `${displayQuery} > :${`${aliasName}_${searchFiltersObject[aliasName]}`}`;
                paramObj = {
                  [`${aliasName}_${searchFiltersObject[aliasName]}`]: searchVal,
                };

                break;
              case 'gte':
                whereString = `${displayQuery} >= :${`${aliasName}_${searchFiltersObject[aliasName]}`}`;
                paramObj = {
                  [`${aliasName}_${searchFiltersObject[aliasName]}`]: searchVal,
                };

                break;
              case 'begin':
                whereString = `${displayQuery} LIKE :${`${`${aliasName}_${searchFiltersObject[aliasName]}`}_1`}`;
                paramObj = {
                  [`${`${aliasName}_${searchFiltersObject[aliasName]}`}_1`]: `${searchVal}%`,
                };

                break;
              case 'notbegin':
                whereString = `${displayQuery} NOT LIKE :${`${aliasName}_${searchFiltersObject[aliasName]}`}`;
                paramObj = {
                  [`${aliasName}_${searchFiltersObject[aliasName]}`]: `${searchVal}%`,
                };

                break;
              case 'end':
                whereString = `${displayQuery} LIKE :${`${aliasName}_${searchFiltersObject[aliasName]}`}`;
                paramObj = {
                  [`${aliasName}_${searchFiltersObject[aliasName]}`]: `%${searchVal}`,
                };

                break;
              case 'notend':
                whereString = `${displayQuery} NOT LIKE :${`${aliasName}_${searchFiltersObject[aliasName]}`}`;
                paramObj = {
                  [`${aliasName}_${searchFiltersObject[aliasName]}`]: `%${searchVal}`,
                };

                break;
              case 'contain':
                whereString = `${displayQuery} LIKE :${`${aliasName}_${searchFiltersObject[aliasName]}`}`;
                paramObj = {
                  [`${aliasName}_${searchFiltersObject[aliasName]}`]: `%${searchVal}%`,
                };

                break;
              case 'notcontain':
                whereString = `${displayQuery} NOT LIKE :${`${aliasName}_${searchFiltersObject[aliasName]}`}`;
                paramObj = {
                  [`${aliasName}_${searchFiltersObject[aliasName]}`]: `%${searchVal}%`,
                };

                break;
              case 'in':
              case 'range':
                if (_.isArray(searchVal) && searchVal.length > 0) {
                  if (havingMulti) {
                    const rangeData = searchVal.join('|');
                    whereString = `CONCAT(',', ${displayQuery}, ',') REGEXP ',(:${`${aliasName}_${searchFiltersObject[aliasName]}`}),'`;
                    paramObj = {
                      [`${aliasName}_${searchFiltersObject[aliasName]}`]:
                        rangeData,
                    };
                  } else {
                    whereString = `${displayQuery} IN (:...${`${aliasName}_${searchFiltersObject[aliasName]}`})`;
                    paramObj = {
                      [`${aliasName}_${searchFiltersObject[aliasName]}`]:
                        searchVal,
                    };
                  }
                } else if (_.isString(searchVal)) {
                  whereString = `${displayQuery} = :${`${aliasName}_${searchFiltersObject[aliasName]}`}`;
                  paramObj = {
                    [`${aliasName}_${searchFiltersObject[aliasName]}`]:
                      searchVal,
                  };
                }
                break;
              case 'notin':
                if (_.isArray(searchVal) && searchVal.length > 0) {
                  whereString = `${displayQuery} NOT IN (:...${`${aliasName}_${searchFiltersObject[aliasName]}`})`;
                  paramObj = {
                    [`${aliasName}_${searchFiltersObject[aliasName]}`]:
                      searchVal,
                  };
                } else if (_.isString(searchVal)) {
                  whereString = `${displayQuery} <> :${`${aliasName}_${searchFiltersObject[aliasName]}`}`;
                  paramObj = {
                    [`${aliasName}_${searchFiltersObject[aliasName]}`]:
                      searchVal,
                  };
                }
                break;
              case 'between':
                // case 'bt':
                if (_.isObject(searchVal) && searchVal['from'] && searchVal['to']) {
                  whereString = `(${displayQuery} BETWEEN :${`${aliasName}_${searchFiltersObject[aliasName]}`}_start AND :${`${aliasName}_${searchFiltersObject[aliasName]}`}_end)`;
                  paramObj = {
                    [`${`${aliasName}_${searchFiltersObject[aliasName]}`}_start`]:
                      searchVal['from'],
                    [`${`${aliasName}_${searchFiltersObject[aliasName]}`}_end`]:
                      searchVal['to'],
                  };
                } else if (_.isArray(searchVal) && searchVal.length == 2) {
                  whereString = `(${displayQuery} BETWEEN :${`${aliasName}_${searchFiltersObject[aliasName]}`}_start AND :${`${aliasName}_${searchFiltersObject[aliasName]}`}_end)`;
                  paramObj = {
                    [`${`${aliasName}_${searchFiltersObject[aliasName]}`}_start`]:
                      searchVal[0],
                    [`${`${aliasName}_${searchFiltersObject[aliasName]}`}_end`]:
                      searchVal[1],
                  };
                }
                break;
              case 'empty':
                whereString = `(${displayQuery} IS NULL OR ${displayQuery} = '')`;
                paramObj = {};

                break;
              case 'notempty':
                whereString = `(${displayQuery} IS NOT NULL OR ${displayQuery} <> '')`;
                paramObj = {};

                break;
              default:
                whereString = `${displayQuery} = :${`${aliasName}_${searchFiltersObject[aliasName]}`}`;
                paramObj = {
                  [`${aliasName}_${searchFiltersObject[aliasName]}`]: searchVal,
                };

                break;
            }
            if (filterParams.filterMatch == 'or') {
              qb.orWhere(whereString, paramObj);
            } else {
              qb.andWhere(whereString, paramObj);
            }
          }
        }

        if (!custom.isEmpty(keyword)) {
          if ('column_filters' in serviceConfig) {
            const columnFilters = serviceConfig.column_filters;
            if (_.isArray(columnFilters) && columnFilters.length > 0) {
              const subBrackets = new Brackets((qb) => {
                for (const aliasName of columnFilters) {
                  if (aliasName in listConfig) {
                    const fieldConfig = listConfig[aliasName];
                    let displayQuery = fieldConfig.display_query;
                    let rawQuery = null;
                    if (fieldConfig.entry_type === 'Custom') {
                      rawQuery = true;
                    } else {
                      rawQuery = false;
                    }
                    if (fieldConfig.sql_func) {
                      displayQuery = this.processSQLFunction(
                        fieldConfig.sql_func,
                        displayQuery,
                      );
                      rawQuery = true;
                    }
                    qb.orWhere(`${displayQuery} LIKE :keyword`, {
                      keyword: `%${keyword}%`,
                    });
                  }
                }
              });
              qb.where(subBrackets);
            }
          } else if ('global_filters' in serviceConfig) {
            // const globalFilters = serviceConfig.global_filters;
            // const numberType = [
            //   'tinyint',
            //   'smallint',
            //   'mediumint',
            //   'int',
            //   'bigint',
            //   'float',
            //   'decimal',
            //   'double',
            // ];
            // const dateType = ['date', 'datetime', 'timestamp'];
            // const numberFields = [];
            // const dateFields = [];
            // const textFields = [];
            // for (const filterObj of globalFilters) {
            //   if (numberType.includes(filterObj.type)) {
            //     numberFields.push(filterObj);
            //   } else if (dateType.includes(filterObj.type)) {
            //     dateFields.push(filterObj);
            //   } else {
            //     textFields.push(filterObj);
            //   }
            // }
            // const tmpSearch = [];
            // if (keyword.indexOf(',') >= 0) {
            //   const list = keyword.split(',');
            //   for (const item of list) {
            //     const tmpQuery = this.applyGlobalSearch(item.trim(), {
            //       filter_config: filterConfig,
            //       text_fields: textFields,
            //       number_fields: numberFields,
            //       date_fields: dateFields,
            //     });
            //     if (tmpQuery) {
            //       tmpSearch.push(`( ${tmpQuery} )`);
            //     }
            //   }
            //   if (_.isArray(tmpSearch) && tmpSearch.length > 0) {
            //     const globalClause = tmpSearch.join(' AND ');
            //     whereClauses.push(`(${globalClause})`);
            //   }
            // } else {
            //   const globalClause = this.applyGlobalSearch(keyword, {
            //     filter_config: filterConfig,
            //     text_fields: textFields,
            //     number_fields: numberFields,
            //     date_fields: dateFields,
            //   });
            //   if (globalClause) {
            //     whereClauses.push(`(${globalClause})`);
            //   }
            // }
          }
        }
      });
      queryObject.andWhere(brackets);
    }
  }

  // applyGlobalSearch = (keyword, searchConfig) => {
  //   const filterConfig = searchConfig.filter_config;
  //   const textFields = searchConfig.text_fields;
  //   const numberFields = searchConfig.number_fields;
  //   const dateFields = searchConfig.date_fields;

  //   let searchSql;
  //   if (keyword.substr(0, 5) === 'text:') {
  //     keyword = keyword.substr(5);
  //     searchSql = this.textFilterQuery(keyword, textFields);
  //   } else if (keyword.substr(0, 5) === 'date:') {
  //     searchSql = this.dateFilterQuery(keyword, dateFields);
  //   } else if (keyword.substr(0, 7) === 'number:') {
  //     keyword = keyword.substr(5);
  //     searchSql = this.numberFilterQuery(keyword, numberFields);
  //   } else {
  //     let tmpSql = this.columnFilterQuery(keyword, filterConfig);
  //     if (tmpSql !== false) {
  //       searchSql = tmpSql;
  //     } else {
  //       tmpSql = this.numberFilterQuery(keyword, numberFields);
  //       if (tmpSql !== false) {
  //         searchSql = tmpSql;
  //       } else {
  //         tmpSql = this.dateFilterQuery(keyword, dateFields);
  //         if (tmpSql !== false) {
  //           searchSql = tmpSql;
  //         } else {
  //           tmpSql = this.textFilterQuery(keyword, textFields);
  //           if (tmpSql !== false) {
  //             searchSql = tmpSql;
  //           }
  //         }
  //       }
  //     }
  //   }
  //   return searchSql;
  // };

  // textFilterQuery = (keyword, textFields) => {
  //   let searchSql: any = false;
  //   if (
  //     !_.isArray(textFields) ||
  //     textFields.length === 0 ||
  //     custom.isEmpty(keyword)
  //   ) {
  //     return searchSql;
  //   }

  //   let midSearch = [];
  //   const tmpSearch = [];
  //   if (keyword.indexOf('+') >= 0) {
  //     const list = keyword.split('+');
  //     textFields.forEach((tField) => {
  //       midSearch = [];
  //       list.forEach((tVal) => {
  //         tVal = tVal.trim();
  //         if (!custom.isEmpty(tVal)) {
  //           if (this.isEnclosedWithQuote(tVal)) {
  //             const sVal = tVal.slice(1, -1);
  //             if (tField.word) {
  //               midSearch.push(
  //                 this.settingsService.raw(
  //                   `MATCH(${tField.field}) AGAINST(?)`,
  //                   [sVal],
  //                 ),
  //               );
  //             } else {
  //               midSearch.push(
  //                 this.settingsService.raw(`${tField.field} REGEXP ?`, [
  //                   `[[:<:]]${sVal}[[:>:]]`,
  //                 ]),
  //               );
  //             }
  //           } else {
  //             midSearch.push(
  //               this.settingsService.raw(`${tField.field} LIKE ?`, [
  //                 `%${tVal}%`,
  //               ]),
  //             );
  //           }
  //         }
  //       });
  //       if (midSearch.length > 0) {
  //         tmpSearch.push(`(${midSearch.join(' AND ')})`);
  //       }
  //     });
  //     if (tmpSearch.length > 0) {
  //       searchSql = `(${tmpSearch.join(' OR ')})`;
  //     }
  //   } else if (keyword.indexOf('*') >= 0) {
  //     const list = keyword.split('*');
  //     textFields.forEach((tField) => {
  //       midSearch = [];
  //       list.forEach((tVal, tKey) => {
  //         tVal = tVal.trim();
  //         if (!custom.isEmpty(tVal)) {
  //           if (tKey === 0) {
  //             if (this.isEnclosedWithQuote(tVal)) {
  //               const sVal = tVal.slice(1, -1);
  //               midSearch.push(
  //                 this.settingsService.raw(`${tField.field} LIKE ?`, [
  //                   `${sVal}%`,
  //                 ]),
  //               );
  //             } else {
  //               midSearch.push(
  //                 this.settingsService.raw(`${tField.field} LIKE ?`, [
  //                   `${tVal}%`,
  //                 ]),
  //               );
  //             }
  //           } else if (tKey === list.length) {
  //             if (this.isEnclosedWithQuote(tVal)) {
  //               const sVal = tVal.slice(1, -1);
  //               midSearch.push(
  //                 this.settingsService.raw(`${tField.field} REGEXP ?`, [
  //                   `[[:<:]]${sVal}[[:>:]]`,
  //                 ]),
  //               );
  //             } else {
  //               midSearch.push(
  //                 this.settingsService.raw(`${tField.field} LIKE ?`, [
  //                   `%${tVal}`,
  //                 ]),
  //               );
  //             }
  //           } else if (this.isEnclosedWithQuote(tVal)) {
  //             const sVal = tVal.slice(1, -1);
  //             midSearch.push(
  //               this.settingsService.raw(`MATCH(${tField.field}) AGAINST(?)`, [
  //                 sVal,
  //               ]),
  //             );
  //           } else {
  //             midSearch.push(
  //               this.settingsService.raw(`${tField.field} LIKE ?`, [
  //                 `%${tVal}%`,
  //               ]),
  //             );
  //           }
  //         }
  //       });
  //       if (midSearch.length > 0) {
  //         tmpSearch.push(`(${midSearch.join(' AND ')})`);
  //       }
  //     });
  //     if (tmpSearch.length > 0) {
  //       searchSql = `(${tmpSearch.join(' OR ')})`;
  //     }
  //   } else if (this.isEnclosedWithQuote(keyword)) {
  //     const sVal = keyword.slice(1, -1);
  //     textFields.forEach((tField) => {
  //       if (tField.word) {
  //         tmpSearch.push(
  //           this.settingsService.raw(`MATCH(${tField.field}) AGAINST(?)`, [
  //             sVal,
  //           ]),
  //         );
  //       } else {
  //         tmpSearch.push(
  //           this.settingsService.raw(`${tField.field} REGEXP ?`, [
  //             `[[:<:]]${sVal}[[:>:]]`,
  //           ]),
  //         );
  //       }
  //     });
  //     if (tmpSearch.length > 0) {
  //       searchSql = `(${tmpSearch.join(' OR ')})`;
  //     }
  //   } else {
  //     const list = keyword.split(' ');
  //     if (list.length > 1) {
  //       textFields.forEach((tField) => {
  //         midSearch = [];
  //         list.forEach((tVal) => {
  //           tVal = tVal.trim();
  //           if (!custom.isEmpty(tVal)) {
  //             if (this.isEnclosedWithQuote(tVal)) {
  //               const sVal = tVal.slice(1, -1);
  //               if (tField.word) {
  //                 midSearch.push(
  //                   this.settingsService.raw(
  //                     `MATCH(${tField.field}) AGAINST(?)`,
  //                     [sVal],
  //                   ),
  //                 );
  //               } else {
  //                 midSearch.push(
  //                   this.settingsService.raw(`${tField.field} REGEXP ?`, [
  //                     `[[:<:]]${sVal}[[:>:]]`,
  //                   ]),
  //                 );
  //               }
  //             } else {
  //               midSearch.push(
  //                 this.settingsService.raw(`${tField.field} LIKE ?`, [
  //                   `%${tVal}%`,
  //                 ]),
  //               );
  //             }
  //           }
  //         });
  //         if (midSearch.length > 0) {
  //           tmpSearch.push(`(${midSearch.join(' OR ')})`);
  //         }
  //       });
  //       if (tmpSearch.length > 0) {
  //         searchSql = `(${tmpSearch.join(' OR ')})`;
  //       }
  //     } else {
  //       textFields.forEach((tField) => {
  //         tmpSearch.push(
  //           this.settingsService.raw(`${tField.field} LIKE ?`, [
  //             `%${keyword}%`,
  //           ]),
  //         );
  //       });
  //       if (tmpSearch.length > 0) {
  //         searchSql = `(${tmpSearch.join(' OR ')})`;
  //       }
  //     }
  //   }
  //   return searchSql;
  // };

  // dateFilterQuery = (keyword, dateFields) => {
  //   let searchSql: any = false;
  //   if (
  //     !_.isArray(dateFields) ||
  //     dateFields.length === 0 ||
  //     custom.isEmpty(keyword)
  //   ) {
  //     return searchSql;
  //   }

  //   let operator = '=';
  //   if (keyword.substr(0, 2) === '>=') {
  //     operator = '>=';
  //     keyword = keyword.substr(2);
  //   } else if (keyword.substr(0, 2) === '<=') {
  //     operator = '<=';
  //     keyword = keyword.substr(2);
  //   } else if (keyword.substr(0, 1) === '>') {
  //     operator = '>';
  //     keyword = keyword.substr(1);
  //   } else if (keyword.substr(0, 1) === '<') {
  //     operator = '<';
  //     keyword = keyword.substr(1);
  //   }

  //   const tmpSearch = [];
  //   if (keyword.indexOf('..') >= 0) {
  //     const list = keyword.split('..');
  //     const startDate = list[0].trim();
  //     const endDate = list[1].trim();
  //     for (const dField of dateFields) {
  //       if (
  //         this.general.isValidDate(startDate, dField.type) &&
  //         this.general.isValidDate(endDate, dField.type)
  //       ) {
  //         tmpSearch.push(
  //           this.settingsService.raw(`${dField.field} BETWEEN ? AND ?`, [
  //             startDate,
  //             endDate,
  //           ]),
  //         );
  //       }
  //     }
  //   } else {
  //     for (const dField of dateFields) {
  //       if (this.general.isValidDate(keyword, dField.type)) {
  //         tmpSearch.push(
  //           this.settingsService.raw(`${dField.field} ${operator} ?`, [
  //             keyword,
  //           ]),
  //         );
  //       }
  //     }
  //   }
  //   if (tmpSearch.length > 0) {
  //     searchSql = `(${tmpSearch.join(' OR ')})`;
  //   }
  //   return searchSql;
  // };

  // numberFilterQuery = (keyword, numberFields) => {
  //   let searchSql: any = false;
  //   if (
  //     !_.isArray(numberFields) ||
  //     numberFields.length === 0 ||
  //     custom.isEmpty(keyword)
  //   ) {
  //     return searchSql;
  //   }

  //   let operator = '=';
  //   if (keyword.substr(0, 2) === '>=') {
  //     operator = '>=';
  //     keyword = keyword.substr(2);
  //   } else if (keyword.substr(0, 2) === '<=') {
  //     operator = '<=';
  //     keyword = keyword.substr(2);
  //   } else if (keyword.substr(0, 1) === '>') {
  //     operator = '>';
  //     keyword = keyword.substr(1);
  //   } else if (keyword.substr(0, 1) === '<') {
  //     operator = '<';
  //     keyword = keyword.substr(1);
  //   }

  //   const tmpSearch = [];
  //   if (keyword.indexOf('..') >= 0) {
  //     const list = keyword.split('..');
  //     const startNumber = list[0];
  //     const endNumber = list[1];
  //     if (Number(startNumber) && Number(endNumber)) {
  //       for (const nField of numberFields) {
  //         tmpSearch.push(
  //           this.settingsService.raw(`${nField.field} BETWEEN ? AND ?`, [
  //             startNumber,
  //             endNumber,
  //           ]),
  //         );
  //       }
  //     }
  //   } else if (Number(keyword)) {
  //     for (const nField of numberFields) {
  //       tmpSearch.push(
  //         this.settingsService.raw(`${nField.field} ${operator} ?`, [keyword]),
  //       );
  //     }
  //   }
  //   if (tmpSearch.length > 0) {
  //     searchSql = `(${tmpSearch.join(' OR ')})`;
  //   }
  //   return searchSql;
  // };

  // columnFilterQuery = (keyword, filterConfig) => {
  //   let searchSql = false;
  //   const listColumns = filterConfig.list_columns;
  //   const columnsList = listColumns ? JSON.parse(listColumns) : [];
  //   if (!_.isArray(columnsList) || columnsList.length === 0) {
  //     return searchSql;
  //   }

  //   let searchCol = '';
  //   let searchTxt = '';
  //   for (let i = 1; i < 100; i += 1) {
  //     if (keyword.substr(0, i.toString().length + 2) === `#${i}:`) {
  //       if (columnsList[i - 1]) {
  //         searchCol = columnsList[i - 1];
  //         searchTxt = keyword.substr(i.toString().length + 2);
  //         break;
  //       }
  //     }
  //   }
  //   if (custom.isEmpty(searchCol) || custom.isEmpty(searchTxt)) {
  //     return searchSql;
  //   }
  //   const fieldConfig = filterConfig.list_config[searchCol];
  //   if (!_.isArray(fieldConfig) || fieldConfig.length === 0) {
  //     return searchSql;
  //   }

  //   let displayQuery = fieldConfig.display_query;
  //   if (fieldConfig.sql_func) {
  //     displayQuery = this.processSQLFunction(
  //       fieldConfig.sql_func,
  //       displayQuery,
  //     );
  //   }
  //   const columnConfig = [
  //     {
  //       field: displayQuery,
  //       word: fieldConfig.fulltext,
  //     },
  //   ];
  //   const tmpSql = this.applyGlobalSearch(searchTxt, {
  //     filter_config: filterConfig,
  //     text_fields: columnConfig,
  //     number_fields: columnConfig,
  //     date_fields: columnConfig,
  //   });
  //   if (tmpSql) {
  //     searchSql = tmpSql;
  //   }
  //   return searchSql;
  // };

  getListSortingClause(queryObject: any, sortParams: any, sortConfig: any) {
    if (typeof sortParams.sort === 'string') {
      try {
        sortParams.sort = JSON.parse(sortParams.sort);
      } catch (err) {
        sortParams.sort = [];
      }
    }
    const sortList = sortParams.sort;

    const serviceConfig = sortConfig.service_config;
    const listConfig = sortConfig.list_config;

    // Default Sorting
    if (sortConfig.default_sort) {
      const defaultList = serviceConfig.default_sorting;
      if (_.isArray(defaultList) && defaultList.length > 0) {
        for (const sortObj of defaultList) {
          if (sortObj.dir.toLowerCase() === 'desc') {
            queryObject.addOrderBy(`${sortObj.prop}`, 'DESC');
          } else {
            queryObject.addOrderBy(`${sortObj.prop}`, 'ASC');
          }
        }
      }
    }

    // Grid Sorting
    if (_.isArray(sortList) && sortList.length > 0) {
      for (const sortObj of sortList) {
        if (sortObj.prop in listConfig) {
          if (
            sortObj.dir.toLowerCase() === 'down' ||
            sortObj.dir.toLowerCase() === 'desc'
          ) {
            queryObject.addOrderBy(`${sortObj.prop}`, 'DESC');
          } else {
            queryObject.addOrderBy(`${sortObj.prop}`, 'ASC');
          }
        }
      }
    } else if (_.isObject(sortList) && !_.isEmpty(sortList)) {
      const aliasName = Object.keys(sortList)[0];
      const dataOrder = Object.values(sortList)[0];
      if (aliasName in listConfig) {
        if (dataOrder.toLowerCase() === 'desc') {
          queryObject.addOrderBy(`${aliasName}`, 'DESC');
        } else {
          queryObject.addOrderBy(`${aliasName}`, 'ASC');
        }
      }
    }
  }

  isEnclosedWithQuote = (keyword) => {
    if (
      keyword.substr(0, 1) === '"' &&
      keyword.substr(-1) === '"' &&
      (keyword.match(/"/g) || []).length === 2
    ) {
      return true;
    }
    return false;
  };

  processSQLFunction(sqlStmt: string, queryStmt: string) {
    let finalQuery = queryStmt;
    if (sqlStmt) {
      if (sqlStmt.indexOf('%q') >= 0) {
        finalQuery = sqlStmt.replace('%q', queryStmt);
      } else {
        finalQuery = sqlStmt;
      }
    }
    return finalQuery;
  }

  convertServerData = (fieldValue, fieldConfig) => {
    let finalValue = fieldValue;
    if (['date', 'date_and_time', 'time'].includes(fieldConfig.type)) {
      if (fieldConfig.type === 'date') {
        finalValue = this.general.getDateTime('cus_date', {
          value: fieldValue,
          format: fieldConfig.format,
        });
      } else if (fieldConfig.type === 'time') {
        finalValue = this.general.getDateTime('cus_time', {
          value: fieldValue,
          format: fieldConfig.format,
        });
      } else {
        finalValue = this.general.getDateTime('cus_datetime', {
          value: fieldValue,
          format: fieldConfig.format,
        });
      }
    }
    return finalValue;
  };

  convertClientData = (fieldValue, fieldConfig) => {
    let finalValue = fieldValue;
    if (['date', 'date_and_time', 'time'].includes(fieldConfig.type)) {
      if (fieldConfig.type === 'date_and_time') {
        finalValue = this.general.getDateTime('cus_date', {
          value: fieldValue,
          format: 'yyyy-MM-dd',
        });
      } else if (fieldConfig.type === 'time') {
        finalValue = this.general.getDateTime('cus_time', {
          value: fieldValue,
          format: 'HH:mm:ss',
        });
      } else {
        finalValue = this.general.getDateTime('cus_time', {
          value: fieldValue,
          format: 'yyyy-MM-dd HH:mm:ss',
        });
      }
    }
    return finalValue;
  };

  async getServiceObject(serviceName, folderName) {
    const servicePath = `../modules/api/${folderName}/services/module/${serviceName}.module.service`;
    const serviceObject = await import(servicePath);
    const newObject = new serviceObject.default();
    return newObject;
  }

  async uploadFormFile(reqParams, reqFiles) {
    let success;
    let message;
    let data;
    try {
      const moduleName = reqParams.module;
      const fieldName = reqParams.name;
      const fielData = reqFiles.file_data;

      if (!moduleName) {
        throw new Error('Module name is required');
      }
      if (!fieldName) {
        throw new Error('Field name is required');
      }
      if (_.isEmpty(fielData)) {
        throw new Error('Upload file is missing');
      }

      if (!_.isObject(moduleConfig[moduleName])) {
        throw new Error('Module configuration is missing');
      }

      const serviceObject: ModuleServiceObjectInterface =
        await this.getServiceObject(
          moduleConfig[moduleName].module_name,
          moduleConfig[moduleName].folder_name,
        );

      if (!serviceObject || !_.isObject(serviceObject)) {
        throw new Error('Module configuration is missing');
      }

      const formConfig: any = serviceObject.getFormConfiguration();
      const fieldConfig: FormConfigFieldInterface = formConfig[fieldName];

      if (!_.isObject(fieldConfig)) {
        throw new Error('Field configuration is missing');
      }

      if (!fieldConfig.file_config) {
        throw new Error('File configuration is missing');
      }
      if (!fieldConfig.file_folder) {
        throw new Error('Upload folder is missing');
      }

      if (
        !this.general.validateFileFormat(
          fieldConfig.file_format,
          fielData.originalname,
        )
      ) {
        throw new Error('File extension is not allowed');
      }

      if (
        !this.general.validateFileSize(fielData.size, fieldConfig.file_size)
      ) {
        throw new Error('File size exceeded the maximum size');
      }

      const fileProp: any = this.general.getFileAttributes(
        fielData.originalname,
      );

      const fileName = await this.general.temporaryUpload(fielData);
      await Promise.all(fileName);

      if (reqParams.old_file) {
        const oldFile = `${this.configService.get('app.upload_temp_path')}${reqParams.old_file
          }`;
        if (this.general.isFile(oldFile)) {
          this.general.deleteFile(oldFile);
        }
      }

      const apiURL = await this.cacheService.get('API_URL');
      const tempUrl = this.configService.get('app.upload_temp_url');
      data = {
        name: fileName,
        url: `${apiURL}/${tempUrl}${fileName}`,
        type: fileProp.file_cat,
        width: '',
        height: '',
      };

      if (fileProp.file_cat === 'image') {
        if (fieldConfig.file_width) {
          data.width = parseInt(fieldConfig.file_width, 10);
        }
        if (fieldConfig.file_height) {
          data.height = parseInt(fieldConfig.file_height, 10);
        }
        if (data.width || data.height) {
          data.url = await this.general.getResizeImageUrl(
            data.url,
            data.width,
            data.height,
            {
              source: 'local',
              resize_mode: 'cover',
            },
          );
        }
      }
      success = 1;
      message = 'File uploaded successfully';
      return ResponseHandler.standard(200, success, message, data);
    } catch (err) {
      this.log.error('uploadFormFile >> Error:', err);
      return ResponseHandler.error(200, err.message);
    }
  }

  deleteFormFile = async (reqParams) => {
    let success;
    let message;
    try {
      const moduleName = reqParams.module;
      const fieldName = reqParams.name;
      let recordIds = [];
      if (_.isArray(reqParams.ids)) {
        recordIds = reqParams.ids;
      } else if (reqParams.ids) {
        recordIds = reqParams.ids.split(',');
      }
      if (!_.isArray(recordIds) || !recordIds.length) {
        throw new Error('Record ids are missing');
      }
      if (!_.isObject(moduleConfig[moduleName])) {
        throw new Error('Module configuration is missing');
      }

      const serviceObject: ModuleServiceObjectInterface =
        await this.getServiceObject(
          moduleConfig[moduleName].module_name,
          moduleConfig[moduleName].folder_name,
        );
      if (!serviceObject || !_.isObject(serviceObject)) {
        throw new Error('Module configuration is missing');
      }

      const { serviceConfig } = serviceObject;
      const formConfig: any = serviceObject.getFormConfiguration();
      const fieldConfig: FormConfigFieldInterface = formConfig[fieldName];
      if (!_.isObject(fieldConfig)) {
        throw new Error('Field configuration is missing');
      }
      if (!fieldConfig.file_config) {
        throw new Error('File configuration is missing');
      }

      const primaryKey = serviceConfig.primary_key;
      const queryField = fieldConfig.field_name;
      const table_name = serviceConfig.table_name;

      const query = `UPDATE ${table_name} SET ${queryField} = null where ${primaryKey} IN (${recordIds})`;
      const queryResult: UpdateResult = await this.settingEntityRepo.query(
        query,
      );
      const { affected } = queryResult;

      if (affected == 0) {
        throw new Error('Failure in file(s) deletion');
      }
      success = 1;
      message = 'File(s) deleted successfully';
      return ResponseHandler.standard(200, success, message, []);
    } catch (err) {
      this.log.error('deleteFormFile >> Error:', err);
      success = 0;
      message = err.message;

      return ResponseHandler.error(200, message);
    }
  };

  downloadFormFile = async (reqParams) => {
    let success;
    let message;
    let data;
    try {
      const moduleName = reqParams.module;
      const fieldName = reqParams.name;

      let recordIds = [];
      if (_.isArray(reqParams.ids)) {
        recordIds = reqParams.ids;
      } else if (reqParams.ids) {
        recordIds = reqParams.ids.split(',');
      }
      if (!_.isArray(recordIds) || !recordIds.length) {
        throw new Error('Record ids are missing');
      }
      if (!_.isObject(moduleConfig[moduleName])) {
        throw new Error('Module configuration is missing');
      }

      const serviceObject: ModuleServiceObjectInterface =
        await this.getServiceObject(
          moduleConfig[moduleName].module_name,
          moduleConfig[moduleName].folder_name,
        );
      if (!serviceObject || !_.isObject(serviceObject)) {
        throw new Error('Module configuration is missing');
      }

      const { serviceConfig } = serviceObject;
      const formConfig: any = serviceObject.getFormConfiguration();
      const fieldConfig: FormConfigFieldInterface = formConfig[fieldName];
      if (!_.isObject(fieldConfig)) {
        throw new Error('Field configuration is missing');
      }
      if (!fieldConfig.file_config) {
        throw new Error('File configuration is missing');
      }

      const primaryKey = serviceConfig.primary_key;
      const queryField = fieldConfig.field_name;
      const table_name = serviceConfig.table_name;
      const limit = this.configService.get('app.admin_download_files_limit');
      const query = `SELECT ${primaryKey},${queryField} FROM ${table_name} where ${primaryKey} IN (${recordIds}) limit ${limit}`;
      const queryResult = await this.settingEntityRepo.query(query);

      const fileName = queryResult[0][queryField];
      if (!fileName) {
        throw new Error('No file(s) found to download');
      }

      const fileConfig: any = {};
      fileConfig.image_name = fileName;
      fileConfig.extensions = fieldConfig.file_format;
      // fileConfig.height = fieldConfig.file_height;
      // fileConfig.width = fieldConfig.file_width;
      // fileConfig.color = fieldConfig.file_bgcolor;
      // TODO: Sub Folder
      fileConfig.path = fieldConfig.file_folder;
      fileConfig.source = fieldConfig.file_server;

      const downloadUrl = await this.general.getFile(fileConfig, reqParams);
      // TODO: multi download script
      const tmpUploadPath = this.configService.get('app.upload_temp_path');

      const filePath = `${tmpUploadPath}${fileName}`;

      await this.general.writeURLData(downloadUrl, filePath);

      data = {
        download_path: filePath,
        download_name: fileName,
      };
      success = 1;
      message = 'File(s) downloaded successfully';
    } catch (err) {
      this.log.error('downloadFormFile >> Error:', err);
      success = 0;
      message = err.message;
    }

    return {
      settings: {
        success,
        message,
      },
      file: data,
    };
  };
}
