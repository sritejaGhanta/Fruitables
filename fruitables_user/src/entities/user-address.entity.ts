import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

enum STATUS {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

@Entity('user_address')
export class UserAddressEntity {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ type: 'int', nullable: true })
  iUserId: number;

  @Column({ type: 'varchar', nullable: true, length: 255 })
  vLandMark: string;

  @Column({ type: 'varchar', nullable: true, length: 255 })
  vFirstName: string;

  @Column({ type: 'varchar', nullable: true, length: 255 })
  vLastName: string;

  @Column({ type: 'varchar', nullable: true, length: 255 })
  vPhoneNumber: string;

  @Column({ type: 'varchar', nullable: true, length: 10 })
  vDialCode: string;

  @Column({ type: 'varchar', nullable: true, length: 255 })
  vAddress: string;

  @Column({ type: 'varchar', nullable: true, length: 255 })
  vStateName: string;

  @Column({ type: 'varchar', nullable: true, length: 255 })
  vCountryName: string;

  @Column({ type: 'varchar', nullable: true, length: 255 })
  vPinCode: string;

  @Column({ type: 'enum', nullable: true, enum: STATUS })
  eStatus: STATUS;

  @Column({ type: 'varchar', nullable: true, length: 255 })
  vCity: string;

  @CreateDateColumn({
    type: 'timestamp',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
