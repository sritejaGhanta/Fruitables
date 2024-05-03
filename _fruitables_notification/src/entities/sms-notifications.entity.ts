import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

enum STATUS {
  PENDING = 'Pending',
  INPROCESS = 'Inprocess',
  EXECUTED = 'Executed',
  FAILED = 'Failed',
}
enum TYPE {
  API = 'API',
  ADMIN = 'Admin',
  FRONT = 'Front',
  NOTIFICATIONS = 'Notifications',
}

@Entity({ name: 'mod_sms_notifications' })
export class SmsNotificationsEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ nullable: true, length: 20 })
  receiver: string;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ type: 'text', nullable: true })
  error: string;

  @Column({ type: 'enum', enum: TYPE, default: TYPE.API })
  type: TYPE;

  @Column({ nullable: true })
  code: string;

  @Column({ type: 'enum', enum: STATUS, default: STATUS.PENDING })
  status: STATUS;

  @Column({ type: 'datetime', nullable: true })
  executedAt: Date;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  deletedAt: Date;
}
