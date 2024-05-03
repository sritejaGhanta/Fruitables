import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { NotifyOperationValuesEntity } from 'src/entities/notify-operation-values.entity';
import { NotifyScheduleEntity } from 'src/entities/notify-schedule.entity';
import { OperationExecuteService } from './operation_execute.service';
import { CitGeneralLibrary } from 'src/utilities/cit-general-library';

@Injectable()
export class OperationService {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(NotifyScheduleEntity)
    protected notifyScheduleEntityRepo: Repository<NotifyScheduleEntity>,
    @InjectRepository(NotifyOperationValuesEntity)
    protected notifyOperationValuesEntityEntityRepo: Repository<NotifyOperationValuesEntity>,
    private operationExecuteService: OperationExecuteService,

    protected readonly general: CitGeneralLibrary,
    protected readonly configService: ConfigService,
  ) {}

  async executeOperation() {
    try {
      const db_notify_operation = await this.getNotifyPendingRecords();
      if (db_notify_operation.length == 0) {
        throw new Error('No records found!');
      }
      const ids = [];
      db_notify_operation.forEach((ele) => {
        ids.push(ele.id);
      });

      await this.updateStatus(ids);

      const notificationArr: any = {};
      db_notify_operation.forEach(async (ele) => {
        const NotificationName = ele.notifyName;

        const db_notify_values: any = await this.getNotifyRecordById(ele.id);
        const old_key = 'OLD_' + db_notify_values.fieldName;
        const new_key = 'NEW_' + db_notify_values.fieldName;
        notificationArr[old_key] = db_notify_values.oldValue;
        notificationArr[new_key] = db_notify_values.newValue;
        notificationArr.OPERATION = ele.operation;
        notificationArr.ENTRYDATE = ele.createdAt;

        const apiResponse =
          await this.operationExecuteService.executeOperationBasedJobs(
            NotificationName,
          );
        this.updateOperBasedResponse(ele.id, apiResponse);
      });
    } catch (error: any) {
      console.log(error);
    }
  }

  async getNotifyPendingRecords() {
    const queryObject = this.notifyScheduleEntityRepo.createQueryBuilder('mns');
    queryObject.select('id,notifyName,operation,createdAt');

    queryObject.limit(
      await this.general.getConfigItem('NOTIFICATIONS_CHUNK_SIZE'),
    );

    queryObject.where('status = :status AND notifyType = :notify_type', {
      status: 'Pending',
      notify_type: 'Operation',
    });

    const db_notify_operation = await queryObject.getRawMany();
    return db_notify_operation;
  }

  async updateStatus(ids: any) {
    const queryColumns: any = { status: 'Inprocess' };
    const updatequeryObject = this.notifyScheduleEntityRepo
      .createQueryBuilder()
      .update(NotifyScheduleEntity)
      .set(queryColumns);
    updatequeryObject.andWhere('id IN (:...ids)', { ids: ids });
    const res = await updatequeryObject.execute();
  }
  async getNotifyRecordById(id: any) {
    const processQueryObject =
      this.notifyOperationValuesEntityEntityRepo.createQueryBuilder('mnop');
    processQueryObject.select('fieldName,oldValue,newValue');
    processQueryObject.where('notifyScheduleId = :id', { id: id });

    const db_notify_values = await processQueryObject.getRawOne();
    return db_notify_values;
  }

  async updateOperBasedResponse(notificationId: any, apiResponse: any) {
    const updatequeryColumns: any = {};
    updatequeryColumns.outputJson = JSON.stringify(apiResponse);
    updatequeryColumns.success = apiResponse.settings.success;
    updatequeryColumns.message = apiResponse.settings.message;
    updatequeryColumns.exeDateTime = new Date();
    updatequeryColumns.status = 'Executed';

    const notifyUpdatequeryObject = this.notifyScheduleEntityRepo
      .createQueryBuilder()
      .update(NotifyScheduleEntity)
      .set(updatequeryColumns);
    notifyUpdatequeryObject.andWhere('id = :id', { id: notificationId });
    const res = await notifyUpdatequeryObject.execute();

    const finalResponse = {
      affected_rows: res.affected,
    };
    return true;
  }
}
