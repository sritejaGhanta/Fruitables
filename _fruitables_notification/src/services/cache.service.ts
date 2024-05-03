import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async set(key: string, item: string): Promise<void> {
    await this.cacheManager.set(key, item);
  }

  async get(key: string): Promise<string | null> {
    return await this.cacheManager.get(key);
  }
}
