    import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
    
    enum IS_EMAIL_VERIFIED {
      YES = 'Yes',
      NO = 'No',
    }
    enum IS_TEMPORARY_PASSWORD {
      YES = 'Yes',
      NO = 'No',
    }
    enum STATUS {
      ACTIVE = 'Active',
      INACTIVE = 'Inactive',
    }

    @Entity('mod_admin')
    export class AdminEntity {
    
      @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
      id: number;
    
      @Column({ type: 'varchar', length: 255 })
      name: string;
    
      @Column({ type: 'varchar', length: 255 })
      email: string;
    
      @Column({ type: 'varchar', length: 255 })
      username: string;
    
      @Column({ type: 'varchar', nullable: true, length: 255 })
      password: string;
    
      @Column({ type: 'varchar', nullable: true, length: 10 })
      dialCode: string;
    
      @Column({ type: 'varchar', nullable: true, length: 20 })
      phoneNumber: string;
    
      @Column({ type: 'int', nullable: true })
      groupId: number;
    
      @Column({ type: 'set', nullable: true })
      authType: string[];
    
      @Column({ type: 'varchar', nullable: true, length: 255 })
      authCode: string;
    
      @Column({ type: 'varchar', nullable: true, length: 10 })
      otpCode: string;
    
      @Column({ type: 'enum', nullable: true, enum: IS_EMAIL_VERIFIED, default: IS_EMAIL_VERIFIED.NO })
      isEmailVerified: IS_EMAIL_VERIFIED;
    
      @Column({ type: 'varchar', nullable: true, length: 10 })
      verificationCode: string;
    
      @Column({ type: 'enum', enum: IS_TEMPORARY_PASSWORD, default: IS_TEMPORARY_PASSWORD.NO })
      isTemporaryPassword: IS_TEMPORARY_PASSWORD;
    
      @Column({ type: 'datetime', nullable: true })
      passwordExpiredOn: Date;
    
      @Column({ type: 'int', nullable: true })
      loginFailedAttempts: number;
    
      @Column({ type: 'datetime', nullable: true })
      loginLockedUntil: Date;
    
      @Column({ type: 'datetime', nullable: true })
      lastLoginAt: Date;
    
      @Column({ type: 'enum', enum: STATUS, default: STATUS.ACTIVE })
      status: STATUS;
    
      @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
      createdAt: Date;
    
      @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
      updatedAt: Date;
    
    }
