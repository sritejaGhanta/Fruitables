import { Injectable, Logger } from '@nestjs/common';
import { Cron, Interval, Timeout } from '@nestjs/schedule';
import { OperationService } from './operation.service';
import { TimeBasedService } from './timebased.service';

@Injectable()
export class JobsService {
  constructor(
    private operationService: OperationService,
    private timeBasedService: TimeBasedService,
  ) {}
  private readonly logger = new Logger(JobsService.name);
}
