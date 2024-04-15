import {
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { APP_INTERCEPTOR, RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocalizationModule } from '@squareboat/nestjs-localization';

import { ApiService } from './api.service';
import { ApiController } from './api.controller';
import { ApiInterceptor } from './api.interceptor';

import { SettingEntity } from 'src/entities/setting.entity';
import { CacheService } from 'src/services/cache.service';
import { EncryptService } from 'src/services/encrypt.service';
import { JwtTokenService } from 'src/services/jwt-token.service';

import { LoggerMiddleware } from 'src/middleware/logger.middleware';
import { SettingMiddleware } from 'src/middleware/setting.middleware';
import { AuthMiddleware } from 'src/middleware/auth.middleware';
import { excludeRoutes } from './exclude.routes';
import RestModule from './rest/rest.module';

import UserModule from './user/user.module';
import AuthModule from './auth/auth.module';
import ToolsModule from './tools/tools.module';

@Module({
  imports: [
    RouterModule.register([
      {
        path: '/api',
        children: [
          {
        path: '/rest',
        module: RestModule,
      },
          {
            path: '/user',
            module: UserModule,
          },
          {
            path: '/auth',
            module: AuthModule,
          },
          {
            path: '/tools',
            module: ToolsModule,
          },
        ],
      },
    ]),
    LocalizationModule.register({
      path: 'src/lang/',
      fallbackLang: 'en',
    }),
    TypeOrmModule.forFeature([
      SettingEntity,
    ]),
    RestModule,
    UserModule,
    AuthModule,
    ToolsModule,
  ],
  controllers: [ApiController],
  providers: [
    ApiService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ApiInterceptor,
    },
    CacheService,
    EncryptService,
    JwtTokenService,
  ],
})
export class ApiModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Logger Middleware
    consumer.apply(LoggerMiddleware).forRoutes('*');
    // Settings Middleware
    consumer.apply(SettingMiddleware).forRoutes('*');
    // Auth MiddleWare
    consumer
      .apply(AuthMiddleware)
      .exclude(...excludeRoutes)
      .forRoutes('api/*');
  }
}
