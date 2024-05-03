import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

enum MODE {
  LIVE = 'live',
  SANDBOX = 'sandbox',
}
enum DEVICE {
  IOS = 'iOS',
  ANDROID = 'Android',
}
enum TYPE {
  API = 'API',
  ADMIN = 'Admin',
  FRONT = 'Front',
  NOTIFICATIONS = 'Notifications',
}
enum STATUS {
  PENDING = 'Pending',
  INPROCESS = 'Inprocess',
  EXECUTED = 'Executed',
  FAILED = 'Failed',
}

@Entity({ name: 'mod_push_notifications' })
export class PushNotificationsEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ nullable: true })
  code: string;

  @Column({ type: 'enum', enum: MODE, default: MODE.LIVE })
  mode: MODE;

  @Column({ type: 'text', nullable: true })
  token: string;

  @Column({ nullable: true, length: 50 })
  title: string;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ type: 'json', nullable: true })
  params: string;

  @Column({ type: 'json', nullable: true })
  varsJson: string;

  @Column({ nullable: true, length: 50 })
  notifyCode: string;

  @Column({ type: 'enum', enum: DEVICE, nullable: true })
  deviceType: DEVICE;

  @Column({ type: 'json', nullable: true })
  sendJson: string;

  @Column({ type: 'text', nullable: true })
  error: string;

  @Column({ nullable: true, length: 50 })
  priority: string;

  @Column({ type: 'enum', enum: TYPE, default: TYPE.API })
  type: TYPE;

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
