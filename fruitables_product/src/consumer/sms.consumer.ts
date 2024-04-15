import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoggerHandler } from 'src/utilities/logger-handler';
import { SmsService } from 'src/services/sms.service';
import { DateService } from 'src/services/date.service';
import { STATUS } from 'src/common/enum/common.enum';
import { SmsNotificationsEntity } from 'src/entities/sms-notifications.entity';

@Processor('sms-queue')
export class SmsConsumer {
  protected readonly log = new LoggerHandler(SmsConsumer.name).getInstance();
  constructor(
    private readonly smsService: SmsService,
    private readonly dateService: DateService,
    @InjectRepository(SmsNotificationsEntity)
    private smsNotifyLogsRepository: Repository<SmsNotificationsEntity>,
  ) {}

  @Process({ name: 'sms-task', concurrency: 10 })
  async handleSmsTask(job: Job) {
    try {
      const data = job.data;

      this.log.log(`Processing sms job for queueOne with data:`, data.id);

      const result_data = await this.smsService.sendSMS(data);
      if ('async' in data && data.async === false) {
        if (result_data.success == 1) {
          this.handleSmsCallBack(null, data.id);
        } else {
          this.handleSmsCallBack(result_data.message, data.id);
        }
      }

      this.log.debug(`Ended sms job for queueOne with data:`, data.id);
    } catch (error) {
      this.log.error(`Error processing job for queueOne:`, error);
    }
  }

  async handleSmsCallBack(error: any, notification_id: number) {
    const queryColumns: any = {};
    queryColumns.status = error === null ? STATUS.EXECUTED : STATUS.FAILED;
    queryColumns.executedAt = this.dateService.getCurrentDateTime();
    if (error != null) {
      queryColumns.error = error.toString();
    }

    const queryObject = this.smsNotifyLogsRepository
      .createQueryBuilder()
      .update(SmsNotificationsEntity)
      .set(queryColumns);
    queryObject.andWhere('id = :id', { id: notification_id });
    await queryObject.execute();
    return true;
  }
}
