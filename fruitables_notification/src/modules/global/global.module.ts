import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';

import { GlobalService } from './global.service';
import { GlobalController } from './global.controller';

import { AzureService } from 'src/services/azure.service';
import { AmazonService } from 'src/services/amazon.service';
import { DateService } from 'src/services/date.service';
import { EmailService } from 'src/services/email.service';
import { EncryptService } from 'src/services/encrypt.service';
import { FileService } from 'src/services/file.service';
import { HttpService } from 'src/services/http.service';
import { JwtTokenService } from 'src/services/jwt-token.service';
import { PushNotifyService } from 'src/services/pushnotify.service';
import { SmsService } from 'src/services/sms.service';
import { CacheService } from 'src/services/cache.service';
import { ModuleService } from 'src/services/module.service';

import { SettingEntity } from 'src/entities/setting.entity';
import { EmailNotifyTemplateEntity } from 'src/entities/email-notify-template.entity';
import { EmailNotificationsEntity } from 'src/entities/email-notifications.entity';
import { PushNotifyTemplateEntity } from 'src/entities/push-notify-template.entity';
import { PushNotificationsEntity } from 'src/entities/push-notifications.entity';
import { SmsNotifyTemplateEntity } from 'src/entities/sms-notify-template.entity';
import { SmsNotificationsEntity } from 'src/entities/sms-notifications.entity';

import { ResponseLibrary } from 'src/utilities/response-library';
import { CitGeneralLibrary } from 'src/utilities/cit-general-library';

import { EmailConsumer } from 'src/consumer/email.consumer';
import { PushConsumer } from 'src/consumer/push.consumer';
import { SmsConsumer } from 'src/consumer/sms.consumer';
import { ApiService } from '../api/api.service';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email-queue',
    }),
    BullModule.registerQueue({
      name: 'push-queue',
    }),
    BullModule.registerQueue({
      name: 'sms-queue',
    }),
    TypeOrmModule.forFeature([
      SettingEntity,
      EmailNotifyTemplateEntity,
      EmailNotificationsEntity,
      PushNotifyTemplateEntity,
      PushNotificationsEntity,
      SmsNotifyTemplateEntity,
      SmsNotificationsEntity,
    ]),
  ],
  controllers: [GlobalController],
  providers: [
    GlobalService,
    AmazonService,
    AzureService,
    DateService,
    EmailService,
    EncryptService,
    FileService,
    HttpService,
    JwtTokenService,
    PushNotifyService,
    SmsService,
    CacheService,
    ResponseLibrary,
    CitGeneralLibrary,
    ModuleService,
    EmailConsumer,
    PushConsumer,
    SmsConsumer,
    ApiService,
  ],
  exports: [
    GlobalService,
    AmazonService,
    AzureService,
    DateService,
    EmailService,
    EncryptService,
    FileService,
    HttpService,
    JwtTokenService,
    PushNotifyService,
    SmsService,
    CacheService,
    ResponseLibrary,
    CitGeneralLibrary,
    ModuleService,
  ],
})
export class GlobalModule {}
