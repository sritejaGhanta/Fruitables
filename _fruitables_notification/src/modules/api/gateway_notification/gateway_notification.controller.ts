import { Controller, UseFilters, Post, Req, Request } from '@nestjs/common';

import { MessagePattern, Payload } from '@nestjs/microservices';
import { HttpExceptionFilter } from 'src/filters/http-exception.filter';
import { CitGeneralLibrary } from 'src/utilities/cit-general-library';
import { GatewayNotificationEmailService } from './services/gateway_notification_email.service';
import { GatewayNotificationEmailDto } from './dto/gateway_notification_email.dto';

@Controller()
@UseFilters(HttpExceptionFilter)
export class GatewayNotificationController {
  constructor(
    protected readonly general: CitGeneralLibrary,
    private gatewayNotificationEmailService: GatewayNotificationEmailService,
  ) {}

  @MessagePattern('gateway_notification_email_custom')
  async gatewayNotificationEmail(@Payload() body) {
    const params = body;
    const request = {};
                
    return await this.gatewayNotificationEmailService.startGatewayNotificationEmail(request, params);
  }

}
