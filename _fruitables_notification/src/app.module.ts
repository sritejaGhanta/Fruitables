import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocalizationModule } from '@squareboat/nestjs-localization';
import { ScheduleModule } from '@nestjs/schedule';

import { typeOrmConfig } from './config/typeOrmConfig';
import appConfig from 'src/config/appConfig';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ApiModule } from './modules/api/api.module';
import { JobsModule } from './modules/jobs/jobs.module';

import { CacheModule } from '@nestjs/cache-manager';

import { MailerModuleWrapper } from './modules/mailer.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
        },
      }),
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        ttl: config.get('app.cache_expiry_time'),
        store: 'memory',
        max: config.get('app.max_cache_allowed'),
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),

    TypeOrmModule.forRoot(typeOrmConfig),
    LocalizationModule.register({
      path: 'src/lang',
      fallbackLang: 'en',
    }),
    MailerModuleWrapper,
    ApiModule,
    JobsModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
