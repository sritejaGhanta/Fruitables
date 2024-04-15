import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LoggerHandler {
  private loggerInstance;
  constructor(name?: string) {
    const contextName = name ?? 'LogHandler';
    this.loggerInstance = new Logger(contextName);
  }
  getInstance() {
    return this.loggerInstance;
  }
}
