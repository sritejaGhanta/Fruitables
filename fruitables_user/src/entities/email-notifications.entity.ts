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

@Entity({ name: 'mod_email_notifications' })
export class EmailNotificationsEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ nullable: true })
  receiver: string;

  @Column({ nullable: true })
  subject: string;

  @Column({ nullable: true })
  content: string;

  @Column({ type: 'json', nullable: true })
  params: string;

  @Column({ nullable: true })
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
