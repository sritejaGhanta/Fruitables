    import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
    
    enum STATUS {
      ACTIVE = 'Active',
      INACTIVE = 'Inactive',
    }

    @Entity('user')
    export class UserEntity {
    
      @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
      iUserId: number;
    
      @Column({ type: 'varchar', nullable: true, length: 255 })
      vProfileImage: string;
    
      @Column({ type: 'varchar', nullable: true, length: 255 })
      vFirstName: string;
    
      @Column({ type: 'varchar', nullable: true, length: 255 })
      vLastName: string;
    
      @Column({ type: 'varchar', nullable: true, length: 255 })
      vEmail: string;
    
      @Column({ type: 'varchar', nullable: true, length: 255 })
      vPassword: string;
    
      @Column({ type: 'varchar', nullable: true, length: 20 })
      vPhoneNumber: string;
    
      @Column({ type: 'varchar', nullable: true, length: 10 })
      vOtpCode: string;
    
      @Column({ type: 'varchar', nullable: true, length: 10 })
      vDialCode: string;
    
      @Column({ type: 'enum', nullable: true, enum: STATUS })
      eStatus: STATUS;
    
      @CreateDateColumn({ type: 'timestamp', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
      createdAt: Date;
    
      @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
      updatedAt: Date;
    
    }
