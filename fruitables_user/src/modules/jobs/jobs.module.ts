import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GlobalModule } from '../global/global.module';
import { JobsService } from './jobs.service';
import { OperationService } from './operation.service';
import { OperationExecuteService } from './operation_execute.service';
import { TimeBasedService } from './timebased.service';
import { NotifyScheduleEntity } from 'src/entities/notify-schedule.entity';
import { NotifyOperationValuesEntity } from 'src/entities/notify-operation-values.entity';

@Module({
  imports: [
    GlobalModule,
    TypeOrmModule.forFeature([
      NotifyScheduleEntity,
      NotifyOperationValuesEntity,
    ]),
  ],
  controllers: [],
  providers: [
    JobsService,
    OperationService,
    OperationExecuteService,
    TimeBasedService,
  ],
})
export class JobsModule {}
