import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, baseUrl } = request;
    const userAgent = request.get('user-agent') || '';

    this.logger.log(`REQUEST  => ${method} ${baseUrl} - ${userAgent} ${ip}`);
    response.on('finish', () => {
      const { statusCode, statusMessage } = response;
      this.logger.log(
        `RESPONSE => ${method} ${baseUrl} ${statusCode} ${statusMessage} - ${userAgent} ${ip}`,
      );
    });

    next();
  }
}
