import { Scope, Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { REQUEST } from '@nestjs/core';
import * as _ from 'lodash';

import { ApiService } from 'src/modules/api/api.service';
import { LoggerHandler } from 'src/utilities/logger-handler';
import { CacheService } from 'src/services/cache.service';

@Injectable({ scope: Scope.REQUEST })
export class SettingMiddleware implements NestMiddleware {
  private readonly log = new LoggerHandler(
    SettingMiddleware.name,
  ).getInstance();

  constructor(
    @Inject(REQUEST) private request: Request,
    private readonly apiService: ApiService,
    private readonly cacheService: CacheService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Sync settings to cache
    const lastSyncedAt = await this.cacheService.get('LAST_SYNCED_AT');
    console.log(lastSyncedAt);
    if (!lastSyncedAt) {
      const data = await this.apiService.syncSettings();
      if (_.isArray(data) && data.length > 0) {
        await this.cacheService.set(
          'LAST_SYNCED_AT',
          new Date().getTime().toString(),
        );
        // TODO: convert to Promise
        data.forEach(async (row) => {
          await this.cacheService.set(row.name, row.value);
        });
        this.log.log('Settings synced to cache');
      }
    }

    next();
  }
}
