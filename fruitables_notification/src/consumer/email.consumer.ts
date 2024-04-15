import {
  Process,
  Processor,
  // OnQueueActive,
  // OnQueueError,
  // OnQueueWaiting,
  // OnQueueStalled,
  // OnQueueProgress,
  // OnQueueCompleted,
  // OnQueueFailed,
  // OnQueuePaused,
  // OnQueueResumed,
  // OnQueueCleaned,
  // OnQueueDrained,
  // OnQueueRemoved,
} from '@nestjs/bull';
import { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoggerHandler } from 'src/utilities/logger-handler';
import { EmailService } from 'src/services/email.service';
import { DateService } from 'src/services/date.service';
import { STATUS } from 'src/common/enum/common.enum';
import { EmailNotificationsEntity } from 'src/entities/email-notifications.entity';

@Processor('email-queue')
export class EmailConsumer {
  protected readonly log = new LoggerHandler(EmailConsumer.name).getInstance();
  constructor(
    private readonly emailService: EmailService,
    private readonly dateService: DateService,
    @InjectRepository(EmailNotificationsEntity)
    private emailNotifyLogsRepository: Repository<EmailNotificationsEntity>,
  ) {}

  @Process({ name: 'email-task', concurrency: 10 })
  async handleEmailTask(job: Job) {
    try {
      const data = job.data;
      this.log.log(
        `Processing job for queueOne with data:`,
        data.id,
        data.uniq_id,
      );

      const result_data = await this.emailService.sendMail(data);

      if ('async' in data && data.async === false) {
        if (result_data.success == 1) {
          this.handleMailCallBack(null, result_data.message, data.id);
        } else {
          this.handleMailCallBack(result_data.message, null, data.id);
        }
      }

      this.log.debug(
        `Ended job for queueOne with data:`,
        data.id,
        data.uniq_id,
      );
    } catch (error) {
      this.log.error(`Error processing job for queueOne:`, error);
    }
  }

  async handleMailCallBack(error: any, info: any, notification_id: number) {
    const queryColumns: any = {};
    queryColumns.status = error === null ? STATUS.EXECUTED : STATUS.FAILED;
    queryColumns.executedAt = this.dateService.getCurrentDateTime();
    if (error != null) {
      queryColumns.error = error.toString();
    }

    const queryObject = this.emailNotifyLogsRepository
      .createQueryBuilder()
      .update(EmailNotificationsEntity)
      .set(queryColumns);
    queryObject.andWhere('id = :id', { id: notification_id });
    await queryObject.execute();
    return true;
  }

  // @OnQueueActive()
  // onActive(job: Job) {
  //   console.log(
  //     `Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
  //   );
  // }

  // @OnQueueError()
  // OnError(job: Job) {
  //   console.log(
  //     `Error in job ${job.id} of type ${job.name} with data ${job.data}...`,
  //   );
  // }

  // @OnQueueWaiting()
  // OnQueueWaiting(job: Job) {
  //   console.log(
  //     `Waiting in job ${job.id} of type ${job.name} with data ${job.data}...`,
  //   );
  // }

  // @OnQueueStalled()
  // OnQueueStalled(job: Job) {
  //   console.log(
  //     `Queue stalled in job ${job.id} of type ${job.name} with data ${job.data}...`,
  //   );
  // }

  // @OnQueueProgress()
  // OnQueueProgress(job: Job) {
  //   console.log(
  //     `Error in job ${job.id} of type ${job.name} with data ${job.data}...`,
  //   );
  // }

  // @OnQueueCompleted()
  // OnQueueCompleted(job: Job) {
  //   console.log(
  //     `OnQueueCompleted in job ${job.id} of type ${job.name} with data ${job.data}...`,
  //   );
  // }

  // @OnQueueFailed()
  // OnQueueFailed(job: Job) {
  //   console.log(
  //     `OnQueueFailed in job ${job.id} of type ${job.name} with data ${job.data}...`,
  //   );
  // }

  // @OnQueuePaused()
  // OnQueuePaused(job: Job) {
  //   console.log(
  //     `OnQueuePaused in job ${job.id} of type ${job.name} with data ${job.data}...`,
  //   );
  // }

  // @OnQueueResumed()
  // OnQueueResumed(job: Job) {
  //   console.log(
  //     `OnQueueResumed in job ${job.id} of type ${job.name} with data ${job.data}...`,
  //   );
  // }

  // @OnQueueCleaned()
  // OnQueueCleaned(job: Job) {
  //   console.log(
  //     `OnQueueCleaned in job ${job.id} of type ${job.name} with data ${job.data}...`,
  //   );
  // }

  // @OnQueueDrained()
  // OnQueueDrained(job: Job) {
  //   console.log(
  //     `OnQueueDrained in job ${job.id} of type ${job.name} with data ${job.data}...`,
  //   );
  // }

  // @OnQueueRemoved()
  // OnQueueRemoved(job: Job) {
  //   console.log(
  //     `OnQueueRemoved in job ${job.id} of type ${job.name} with data ${job.data}...`,
  //   );
  // }
}
