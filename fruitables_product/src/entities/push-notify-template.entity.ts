import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum SILENT {
  YES = 'Yes',
  NO = 'No',
}
enum STATUS {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

@Entity({ name: 'mod_push_notify_template' })
export class PushNotifyTemplateEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column()
  templateTitle: string;

  @Column()
  templateCode: string;

  @Column({ nullable: true, length: 50 })
  title: string;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ nullable: true })
  sound: string;

  @Column({ nullable: true })
  badge: number;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true, length: 10 })
  color: string;

  @Column({ type: 'enum', enum: SILENT, default: SILENT.NO })
  silent: SILENT;

  @Column({ nullable: true, length: 50 })
  priority: string;

  @Column({ nullable: true })
  collapseKey: string;

  @Column({ nullable: true })
  sendInterval: number;

  @Column({ nullable: true })
  expireInterval: number;

  @Column({ type: 'json', nullable: true })
  varsJson: [
    {
      var_name?: string;
      var_desc?: string;
    },
  ];

  @Column({ type: 'enum', enum: STATUS, default: STATUS.ACTIVE })
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
