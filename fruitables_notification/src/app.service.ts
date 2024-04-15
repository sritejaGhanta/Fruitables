import { Injectable } from '@nestjs/common';
import { CacheService } from './services/cache.service';

@Injectable()
export class AppService {
  constructor(protected readonly cacheService: CacheService) {}
  getHello(): string {
    return 'Hello World!';
  }
}
