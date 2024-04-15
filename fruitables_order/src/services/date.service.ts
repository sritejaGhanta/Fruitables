import { Injectable } from '@nestjs/common';
import {
  add,
  addMilliseconds,
  compareAsc,
  differenceInSeconds,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  differenceInMonths,
  differenceInYears,
  format,
  getUnixTime,
  getTime,
  isMatch,
  isValid,
  parse,
  sub,
  subMilliseconds,
} from 'date-fns';

import { CacheService } from './cache.service';
import customConfig from 'src/config/custom-config';
import { LoggerHandler } from 'src/utilities/logger-handler';

@Injectable()
export class DateService {
  private readonly log = new LoggerHandler(DateService.name).getInstance();

  constructor(private readonly cacheService: CacheService) {}

  getCurrentDate(): string {
    return format(new Date(), 'yyyy-MM-dd');
  }

  getCurrentTime(): string {
    return format(new Date(), 'HH:mm:ss');
  }

  getCurrentDateTime(): string {
    return format(new Date(), 'yyyy-MM-dd HH:mm:ss');
  }

  getCurrentTimeStamp(): number {
    return getUnixTime(new Date());
  }

  getCurrentTimeMS(): number {
    return getTime(new Date());
  }

  getDateTimeBefore(value: number, type?: string): string {
    let dateTime;
    if (
      [
        'years',
        'months',
        'weeks',
        'days',
        'hours',
        'minutes',
        'seconds',
      ].includes(type)
    ) {
      const addObj = {};
      addObj[type] = value;
      dateTime = sub(new Date(), addObj);
    } else if (type === 'milliseconds') {
      dateTime = subMilliseconds(new Date(), value);
    }
    return format(dateTime, 'yyyy-MM-dd HH:mm:ss');
  }

  getDateTimeAfter(value: number, type?: string): string {
    let dateTime;
    if (
      [
        'years',
        'months',
        'weeks',
        'days',
        'hours',
        'minutes',
        'seconds',
      ].includes(type)
    ) {
      const addObj = {};
      addObj[type] = value;
      dateTime = add(new Date(), addObj);
    } else if (type === 'milliseconds') {
      dateTime = addMilliseconds(new Date(), value);
    }
    return format(dateTime, 'yyyy-MM-dd HH:mm:ss');
  }

  getDateDBFormat(value?: number | string | Date): string {
    if (!value) return '';
    if (!isValid(new Date(value))) return '';
    return format(new Date(value), 'yyyy-MM-dd');
  }

  getDateTimeDBFormat(value?: number | string | Date): string {
    if (!value) return '';
    if (!isValid(new Date(value))) return '';
    return format(new Date(value), 'yyyy-MM-dd HH:mm:ss');
  }

  getTimeDBFormat(value?: string, srcfmt?: string): string {
    if (!value) return '';
    if (!isMatch(value, srcfmt)) return '';
    const parseDate: Date = parse(value, srcfmt, new Date());
    return format(parseDate, 'HH:mm:ss');
  }

  async getDateSystemFormat(value?: number | string | Date): Promise<string> {
    if (!value || value === '0000-00-00') return '';
    if (!isValid(new Date(value))) return '';

    const dateFormat: string = await this.cacheService.get(
      'ADMIN_DATE_TIME_FORMAT',
    );
    const dstfmt: string = this.getSystemDateFormat(dateFormat);
    return format(new Date(value), dstfmt);
  }

  async getDateTimeSystemFormat(
    value?: number | string | Date,
  ): Promise<string> {
    if (!value || value === '0000-00-00 00:00:00') return '';
    if (!isValid(new Date(value))) return '';

    const dateTimeFormat: string = await this.cacheService.get(
      'ADMIN_DATE_TIME_FORMAT',
    );
    const dstfmt: string = this.getSystemDateTimeFormat(dateTimeFormat);
    return format(new Date(value), dstfmt);
  }

  async getTimeSystemFormat(value?: string): Promise<string> {
    if (!value || value === '00:00:00') return '';
    if (!isMatch(value, 'HH:mm:ss')) return '';

    const timeFormat: string = await this.cacheService.get('ADMIN_TIME_FORMAT');

    const dstfmt: string = this.getSystemTimeFormat(timeFormat);
    const parseDate: Date = parse(value, 'HH:mm:ss', new Date());
    return format(parseDate, dstfmt);
  }

  getDateCustomFormat(value?: number | string | Date, dstfmt?: string): string {
    if (!value || value === '0000-00-00') return '';
    if (!isValid(new Date(value))) return '';
    return format(new Date(value), dstfmt);
  }

  getDateTimeCustomFormat(
    value?: number | string | Date,
    dstfmt?: string,
  ): string {
    if (!value || value === '0000-00-00 00:00:00') return '';
    if (!isValid(new Date(value))) return '';
    return format(new Date(value), dstfmt);
  }

  getTimeCustomFormat(value?: string, dstfmt?: string): string {
    if (!value || value === '00:00:00') return '';
    if (!isMatch(value, 'HH:mm:ss')) return '';
    const parseDate: Date = parse(value, 'HH:mm:ss', new Date());
    return format(parseDate, dstfmt);
  }

  getSystemDateFormat(sysfmt?: string): string {
    const dateFormats = customConfig.dateFormats;
    if (sysfmt === '' || !(sysfmt in dateFormats)) {
      sysfmt = 'dfmt_1';
    }
    return dateFormats[sysfmt];
  }

  getSystemDateTimeFormat(sysfmt?: string): string {
    const dateTimeFormats = customConfig.dateTimeFormats;
    if (sysfmt === '' || !(sysfmt in dateTimeFormats)) {
      sysfmt = 'dtfmt_1';
    }
    return dateTimeFormats[sysfmt];
  }

  getSystemTimeFormat(sysfmt?: string): string {
    const timeFormats = customConfig.timeFormats;
    if (sysfmt === '' || !(sysfmt in timeFormats)) {
      sysfmt = 'tfmt_1';
    }
    return timeFormats[sysfmt];
  }

  isValidDate(value?: number | string | Date): boolean {
    if (!isValid(new Date(value))) {
      return false;
    }
    return true;
  }

  isValidTime(value?: string): boolean {
    if (!isMatch(value, 'HH:mm:ss')) {
      return false;
    }
    return true;
  }

  getSystemFormatLabels(sysfmt?: string, type?: string): string {
    let dateLabels;
    if (type === 'ADMIN_DATE_FORMAT') {
      dateLabels = customConfig.dateLabels;
    } else if (type === 'ADMIN_DATE_TIME_FORMAT') {
      dateLabels = customConfig.dateTimeLabels;
    } else if (type === 'ADMIN_TIME_FORMAT') {
      dateLabels = customConfig.timeLabels;
    }
    if (!sysfmt || !(sysfmt in dateLabels)) {
      sysfmt = 'dfmt_1';
    }
    return dateLabels[sysfmt];
  }

  //  1 if the first date is greater than the second date,
  // -1 if the first date is less than the second date,
  //  0 if both dates are equal.
  compare(dateLeft: number | Date, dateRight: number | Date): number {
    return compareAsc(new Date(dateLeft), new Date(dateRight));
  }

  diff(
    dateLeft: number | string | Date,
    dateRight: number | string | Date,
    type?: string,
  ): number {
    let res = 0;
    dateLeft = new Date(dateLeft);
    dateRight = new Date(dateRight);
    switch (type) {
      case 'seconds':
      case 's':
        res = differenceInSeconds(dateLeft, dateRight);
        break;
      case 'minutes':
      case 'i':
        res = differenceInMinutes(dateLeft, dateRight);
        break;
      case 'hours':
      case 'h':
        res = differenceInHours(dateLeft, dateRight);
        break;
      case 'days':
      case 'd':
        res = differenceInDays(dateLeft, dateRight);
        break;
      case 'months':
      case 'm':
        res = differenceInMonths(dateLeft, dateRight);
        break;
      case 'years':
      case 'y':
      default:
        res = differenceInYears(dateLeft, dateRight);
        break;
    }
    return res;
  }
}
