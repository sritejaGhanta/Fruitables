import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { NotifyScheduleEntity } from 'src/entities/notify-schedule.entity';

@Injectable()
export class TimeBasedService {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(NotifyScheduleEntity)
    protected notifyScheduleEntityRepo: Repository<NotifyScheduleEntity>,
  ) {}

  async insertTimeBasedSchedule() {
    const queryColumns: any = {};
    queryColumns.notifyType = 'Time';
    queryColumns.createdAt = new Date();
    queryColumns.status = 'Inprocess';
    queryColumns.notifyName = 'Static';
    const timeBasedAddQuery = this.notifyScheduleEntityRepo;
    const insertRes = await timeBasedAddQuery.insert(queryColumns);
    const timeBasedInsertRes = {
      id: insertRes.raw.insertId,
    };
    return timeBasedInsertRes;
  }

  async updateTimeBasedSchedule(apiResponse: any, notificationId: number) {
    const updateQueryColumns: any = {};
    updateQueryColumns.outputJson = JSON.stringify(apiResponse);
    updateQueryColumns.success = apiResponse.settings.success;
    updateQueryColumns.message = apiResponse.settings.message;
    updateQueryColumns.exeDateTime = new Date();
    updateQueryColumns.status = 'Executed';

    const notifyUpdatequeryObject = this.notifyScheduleEntityRepo
      .createQueryBuilder()
      .update(NotifyScheduleEntity)
      .set(updateQueryColumns);
    notifyUpdatequeryObject.andWhere('id = :id', {
      id: notificationId,
    });
    const res = await notifyUpdatequeryObject.execute();
  }
}
