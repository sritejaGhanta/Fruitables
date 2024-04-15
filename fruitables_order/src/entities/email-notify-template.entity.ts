import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

enum STATUS {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

@Entity({ name: 'mod_email_notify_template' })
export class EmailNotifyTemplateEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column()
  emailTitle: string;

  @Column()
  emailCode: string;

  @Column({ nullable: true })
  fromName: string;

  @Column({ nullable: true })
  fromEmail: string;

  @Column({ nullable: true })
  replyToName: string;

  @Column({ nullable: true })
  replyToEmail: string;

  @Column({ nullable: true })
  ccEmail: string;

  @Column({ nullable: true })
  bccEmail: string;

  @Column({ nullable: true })
  emailSubject: string;

  @Column({ type: 'text', nullable: true })
  emailMessage: string;

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
