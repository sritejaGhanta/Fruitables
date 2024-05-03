import {
  Controller,
  UseFilters,
  Post,
  Req,
  Request,
  Body,
} from '@nestjs/common';

import { MessagePattern, Payload } from '@nestjs/microservices';
import { HttpExceptionFilter } from 'src/filters/http-exception.filter';
import { CitGeneralLibrary } from 'src/utilities/cit-general-library';
import { GatewayNotificationEmailExtendedService } from './services/extended/gateway_notification_email.extended.service';
import { GatewayNotificationEmailDto } from './dto/gateway_notification_email.dto';

@Controller()
@UseFilters(HttpExceptionFilter)
export class GatewayNotificationController {
  constructor(
    protected readonly general: CitGeneralLibrary,
    private gatewayNotificationEmailService: GatewayNotificationEmailExtendedService,
  ) {}

  @MessagePattern('gateway_notification')
  async gatewayNotificationEmail(@Payload() body) {
    const params = body;
    await this.gatewayNotificationEmailService.startGatewayNotificationEmail(
      {},
      params,
    );
  }
}
