import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GlobalModule } from 'src/modules/global/global.module';
import { RestController } from './rest.controller';

import { CreateTokenService } from './services/create_token.service';
import { ImageResizeService } from './services/image_resize.service';

@Module({
  imports: [GlobalModule, TypeOrmModule.forFeature([])],
  controllers: [RestController],
  providers: [CreateTokenService, ImageResizeService],
})
export default class RestModule {}
