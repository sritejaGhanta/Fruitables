import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

enum STATUS {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

@Entity({ name: 'mod_sms_notify_template' })
export class SmsNotifyTemplateEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column()
  templateTitle: string;

  @Column()
  templateCode: string;

  @Column({ type: 'text', nullable: true })
  message: string;

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
