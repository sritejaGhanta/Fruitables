    import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
    
    enum USER_TYPE {
      ADMIN = 'Admin',
      FRONT = 'Front',
    }

    @Entity('mod_log_history')
    export class LogHistoryEntity {
    
      @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
      id: number;
    
      @Column({ type: 'int' })
      userId: number;
    
      @Column({ type: 'enum', nullable: true, enum: USER_TYPE })
      userType: USER_TYPE;
    
      @Column({ type: 'varchar', nullable: true, length: 50 })
      ip: string;
    
      @Column({ type: 'datetime', nullable: true })
      loginDate: Date;
    
      @Column({ type: 'datetime', nullable: true })
      logoutDate: Date;
    
      @Column({ type: 'datetime', nullable: true })
      lastAccess: Date;
    
      @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
      createdAt: Date;
    
      @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
      updatedAt: Date;
    
    }
