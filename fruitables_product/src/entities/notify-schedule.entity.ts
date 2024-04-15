// import { Json } from 'aws-sdk/clients/robomaker';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

enum STATUS {
  PENDING = 'Pending',
  EXECUTED = 'Executed',
  FAILED = 'Failed',
  DBERROR = 'DBError',
  INPROCESS = 'Inprocess',
}

enum NOTIFY_TYPE {
  TIME = 'Time',
  OPERATION = 'Operation',
}

enum OPERATION {
  INSERT = 'Insert',
  UPDATE = 'Update',
  DELETE = 'Delete',
}

@Entity({ name: 'mod_notify_schedule' })
export class NotifyScheduleEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column()
  notifyName: string;

  @Column({ type: 'enum', enum: NOTIFY_TYPE, default: NOTIFY_TYPE.TIME })
  notifyType: NOTIFY_TYPE;

  @Column({ type: 'enum', enum: NOTIFY_TYPE, default: null })
  operation: OPERATION;

  @Column({ nullable: true })
  success: string;

  @Column({ nullable: true })
  message: string;

  @Column({ type: 'json', nullable: true })
  outputJson: JSON;

  @Column('timestamp', { nullable: true })
  exeDateTime: string;

  @Column({ type: 'enum', enum: STATUS, default: STATUS.PENDING })
  status: STATUS;

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
