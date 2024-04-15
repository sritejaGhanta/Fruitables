import { LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { transports, format } from 'winston';
import { WinstonModule } from 'nest-winston';
import { Loggly } from "winston-loggly-bulk";
import 'winston-daily-rotate-file';

export class CustomLogger implements LoggerService {
  private logger;
  private configService:ConfigService;
  constructor(configService:ConfigService) {
    this.configService = configService;
    const transportConfig = [
      // file on daily rotation (error only)
      new transports.DailyRotateFile({
        // %DATE will be replaced by the current date
        filename: `public/logs/debug/%DATE%/error.log`,
        level: 'error',
        format: format.combine(format.timestamp(), format.json()),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: false, // don't want to zip our logs
        maxFiles: '15d', // will keep log until they are older than 15 days
      }),
      // same for all levels
      new transports.DailyRotateFile({
        filename: `public/logs/debug/%DATE%/all.log`,
        format: format.combine(format.timestamp(), format.json()),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: false,
        maxFiles: '15d',
      }),
      new transports.Console({
        format: format.combine(
          format.cli(),
          format.splat(),
          format.timestamp(),
          format.printf((info) => {
            return `${info.timestamp} ${info.level}: ${info.message}`;
          }),
        ),
      }),
    ];
    if(this.configService.get('ENABLE_LOGGLY') == "Yes"){
      // loggly configuration
      transportConfig.push(new Loggly({
        token: this.configService.get('LOGGLY_TOKEN'),
        subdomain: this.configService.get('LOGGLY_SUB_DOMAIN'),
        tags: ["Winston-NodeJS"],
        json: true,
        level: this.configService.get('LOGGLY_SYNC_LEVEL') == 'error' ? 'error': 'silent',
      }));
    }
    this.logger = WinstonModule.createLogger({
      level: 'info',
      transports: transportConfig
    });
  }

  log(message: any) {
    this.logger.log(message);
  }

  error(message: string, trace: string) {
    this.logger.error(message, trace);
  }

  warn(message: any) {
    this.logger.warn(message);
  }

  debug?(message: any) {
    this.logger.debug(message);
  }

  verbose?(message: any) {
    this.logger.debug(message);
  }
}
