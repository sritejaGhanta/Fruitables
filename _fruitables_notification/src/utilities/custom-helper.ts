import * as _ from 'lodash';
import * as bcrypt from 'bcryptjs';
import * as randomize from 'randomatic';
import { evaluate } from 'mathjs';
import { __ } from '@squareboat/nestjs-localization';
import { pathToRegexp } from 'path-to-regexp';
import apiRoutes from 'src/config/cit-api-routes';

export function getRandomString(pattern: string, length: number, params: any) {
  params = _.isObject(params) ? params : {};
  return randomize(pattern, length, params);
}

export function getRandomNumber(length: number) {
  return randomize('0', length);
}

export function truncateChars(str: string, len: number) {
  len = len || 25;
  if (str.trim() === '' || len < 3) {
    return str;
  }
  if (str.length > len) {
    str = `${str.substr(0, len - 3)}...`;
  }
  return str;
}

export function evaluateExpression(expr: string) {
  if (expr === '') {
    return false;
  }
  return evaluate(expr);
}

export function isExternalURL(url: string) {
  let flag = false;
  if (url) {
    url = url.trim().toLowerCase();
    if (url.substr(0, 8) === 'https://' || url.substr(0, 7) === 'http://') {
      flag = true;
    }
  }
  return flag;
}

export function getTotalPages(total: number, perPage: number) {
  if (perPage === 0) {
    return 1;
  }
  return Math.ceil(total / perPage);
}

export function getStartIndex(page: number, limit: number) {
  page = page > 0 ? page : 1;
  limit = limit > 0 ? limit : 20;
  return (page - 1) * limit;
}

export function getPagination(total, page, limit) {
  const lastPage = Math.ceil(total / limit);
  const nextPage = page + 1 > lastPage ? null : page + 1;
  const prevPage = page - 1 < 1 ? null : page - 1;
  return {
    count: total,
    per_page: limit,
    curr_page: page,
    last_page: lastPage,
    prev_page: prevPage ? true : false,
    next_page: nextPage ? true : false,
  };
}

export function getFilteredList(list: any) {
  const retList = [];
  const tmpList = _.isString(list) ? list.split(',') : list;
  if (_.isArray(tmpList)) {
    for (let i = 0; i < tmpList.length; i += 1) {
      if (!this.isEmpty(tmpList[i])) {
        retList.push(tmpList[i]);
      }
    }
  }
  if (!retList.length) {
    return false;
  }
  return tmpList;
}

export function getAssocDropdown(list: any) {
  const assoc = {};
  if (_.isArray(list)) {
    for (let i = 0; i < list.length; i += 1) {
      const { parId } = list[i];
      if (!_.isArray(assoc[parId])) {
        assoc[parId] = [];
      }
      assoc[parId].push(list[i]);
    }
  }
  return assoc;
}

export function getTreeDropdown(
  data: any,
  id: number,
  inc: number,
  lbl: string,
  opt: string,
) {
  let list = [];
  const items = data[id];
  if (_.isArray(items)) {
    for (let i = 0; i < items.length; i += 1) {
      let lblVal;
      let optVal;
      if (inc === 1) {
        lblVal = `${items[i].val}`;
        optVal = `${items[i].val}`;
      } else {
        lblVal = `${lbl} >> ${items[i].val}`;
        optVal = `${opt} >> ${items[i].val}`;
      }
      list.push({
        id: items[i].id,
        val: items[i].val,
        lblTmp: lblVal,
        optTmp: optVal,
      });
      opt = opt || '';
      const nxtLbl = lblVal;
      const nxtOpt = `${opt}&nbsp;&nbsp;&nbsp;&nbsp;`;
      const children = this.getTreeDropdown(
        data,
        items[i].id,
        inc + 1,
        nxtLbl,
        nxtOpt,
      );
      list = _.union(list, children);
    }
  }
  return list;
}

export function getIPAddress(req: any) {
  let ipAddress = '';
  if (req.headers['X-Forwarded-For']) {
    [ipAddress] = req.headers['X-Forwarded-For'].split(',');
  } else if (req.headers['x-forwarded-for']) {
    [ipAddress] = req.headers['x-forwarded-for'].split(',');
  } else if (req.client.remoteAddress) {
    ipAddress = req.client.remoteAddress;
  } else if (req.connection.remoteAddress) {
    ipAddress = req.connection.remoteAddress;
  } else {
    ipAddress = req.socket.remoteAddress;
  }
  return ipAddress;
}

export function getPasswordHash(password: string) {
  return bcrypt.hashSync(password, 10);
}

export function comparePasswordHash(plainPwd: string, hashPwd: string) {
  return bcrypt.compareSync(plainPwd, hashPwd);
}

export function replaceHashedParameters(str: string, params: any) {
  if (!str) {
    return str;
  }
  if (_.isObject(params)) {
    Object.keys(params).forEach((key) => {
      if (!_.isArray(params[key]) && !_.isObject(params[key])) {
        const hashKey = `#${key}#`;
        if (str.indexOf(hashKey) >= 0) {
          str = str.replace(hashKey, params[key]);
        }
      }
    });
  }
  return str;
}

export function processRequestPregMatch(str: string, params: any) {
  if (!str) {
    return str;
  }
  if (str.indexOf('{%REQUEST') >= 0) {
    const matches = [...str.matchAll(/{%REQUEST\.([a-zA-Z0-9_]{1,})/gi)];
    if (_.isArray(matches) && matches.length > 0) {
      matches.forEach((item) => {
        if (_.isArray(item) && item[1]) {
          const key = item[1];
          if (!_.isArray(params[key]) && !_.isObject(params[key])) {
            if (str.indexOf('{%REQUEST') >= 0) {
              str = str.replace(`{%REQUEST.${key}%}`, params[key]);
            }
          }
        }
      });
    }
  }
  return str;
}

export function processSystemPregMatch(str: string, params: any) {
  if (!str) {
    return str;
  }
  if (str.indexOf('{%SYSTEM') >= 0) {
    const matches = [...str.matchAll(/{%SYSTEM\.([a-zA-Z0-9_]{1,})/gi)];
    if (_.isArray(matches) && matches.length > 0) {
      matches.forEach((item) => {
        if (_.isArray(item) && item[1]) {
          const key = item[1];
          if (str.indexOf('{%SYSTEM') >= 0) {
            str = str.replace(`{%SYSTEM.${key}%}`, params[key]);
          }
        }
      });
    }
  }
  return str;
}

export function compareTime(time1: string, time2: string, operator: string) {
  let field1: any = time1.split(':');
  field1 = parseInt(field1[0], 10) * 3600 + parseInt(field1[1], 10) * 60;

  let field2: any = time2.split(':');
  field2 = parseInt(field2[0], 10) * 3600 + parseInt(field2[1], 10) * 60;

  if (operator === 'timeLessThan') {
    return field1 < field2 ? 1 : 0;
  }
  if (operator === 'timeLessEqual') {
    return field1 <= field2 ? 1 : 0;
  }
  if (operator === 'timeGreaterThan') {
    return field1 > field2 ? 1 : 0;
  }
  if (operator === 'timeGreaterEqual') {
    return field1 >= field2 ? 1 : 0;
  }
  return 0;
}

export function getRouteAPIName(routePath: string, method: string) {
  routePath = routePath.replace(/\/$/, '');
  routePath = routePath.replace(/^\//, '');

  let apiName = routePath;
  const res_methods =
    typeof apiRoutes[method] != 'undefined' ? apiRoutes[method] : [];
  if (Object.keys(res_methods).length > 0) {
    let exact_match = '';

    for (const route in res_methods) {
      const regex = pathToRegexp(route);
      const match = regex.exec(routePath);
      if (match) {
        exact_match = route;
      }
    }

    if (exact_match != '') {
      apiName = res_methods[exact_match];
    }
  }

  return apiName;
}

export function sanitizeUniqueName(item: string) {
  return item
    .toLowerCase()
    .replace(/[^a-z0-9-\s]/g, '')
    .replace(/\s+/g, '_')
    .trim();
}

export function snakeToPascal(str: string) {
  return str
    .split('_')
    .map((substr) => substr.charAt(0).toUpperCase() + substr.slice(1))
    .join('');
}

export function snakeToCamel(str: string) {
  return str
    .toLowerCase()
    .replace(/([-_][a-z])/g, (group) =>
      group.toUpperCase().replace('-', '').replace('_', ''),
    );
}

export function isEmpty(str: any) {
  return (
    _.isNull(str) ||
    _.isUndefined(str) ||
    (_.isString(str) && str.trim() === '')
  );
}

export function lang(
  key: string,
  language?: string | Record<string, any>,
  options?: Record<string, any>,
) {
  let res = __(key, language, options);
  if (res.includes('ERR::INVALID KEY')) {
    res = res.split('==> ')[1];
  }
  return res;
}
