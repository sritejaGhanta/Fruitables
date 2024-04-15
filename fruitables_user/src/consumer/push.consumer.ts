import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoggerHandler } from 'src/utilities/logger-handler';
import { PushNotifyService } from 'src/services/pushnotify.service';
import { DateService } from 'src/services/date.service';
import { STATUS } from 'src/common/enum/common.enum';
import { PushNotificationsEntity } from 'src/entities/push-notifications.entity';
import { PushNotifyConsumerInputDto } from 'src/common/dto/push-notify.dto';

@Processor('push-queue')
export class PushConsumer {
  protected readonly log = new LoggerHandler(PushConsumer.name).getInstance();
  constructor(
    private readonly pushService: PushNotifyService,
    private readonly dateService: DateService,
    @InjectRepository(PushNotificationsEntity)
    private pushNotifyLogsRepository: Repository<PushNotificationsEntity>,
  ) {}

  @Process({ name: 'push-task', concurrency: 10 })
  async handlePushTask(job: Job) {
    try {
      const data: PushNotifyConsumerInputDto = job.data;
      const notify_data = data.notify_data;
      const token_list = data.token_list;

      this.log.log(`Processing job for queueOne with data:`, notify_data.id);

      const result_data = await this.pushService.sendPushNotification(
        notify_data,
        token_list,
      );
      if ('async' in notify_data && notify_data.async === false) {
        if (result_data.success == 1) {
          this.handlePushCallBack(null, result_data.message, notify_data.id);
        } else {
          this.handlePushCallBack(result_data.message, null, notify_data.id);
        }
      }

      this.log.debug(`Ended job for queueOne with data:`, notify_data.id);
    } catch (error) {
      this.log.error(`Error processing job for queueOne:`, error);
    }
  }

  async handlePushCallBack(error: any, info: any, notification_id: number) {
    const queryColumns: any = {};
    queryColumns.status = error === null ? STATUS.EXECUTED : STATUS.FAILED;
    queryColumns.executedAt = this.dateService.getCurrentDateTime();
    if (error != null) {
      queryColumns.error = error.toString();
    }

    const queryObject = this.pushNotifyLogsRepository
      .createQueryBuilder()
      .update(PushNotificationsEntity)
      .set(queryColumns);
    queryObject.andWhere('id = :id', { id: notification_id });
    await queryObject.execute();
    return true;
  }
}
