    import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
    
    enum ID_TYPE {
      ORDER = 'order',
      USER = 'user',
    }
    enum NOTIFICATION_TYPE {
      ORDER_ADD = 'ORDER_ADD',
       ORDER_STATUS_UPDATE = ' ORDER_STATUS_UPDATE',
       USER_ADD = ' USER_ADD',
       FORGOT_PASSWORD = ' FORGOT_PASSWORD',
       USER_CHANGE_PASSWORD = ' USER_CHANGE_PASSWORD',
    }
    enum NOTIFICATION_STATUS {
      SUCCESS = 'success',
       PENDING = ' pending',
       FAILED = ' failed',
    }

    @Entity('gateway_notification')
    export class GatewayNotificationEntity {
    
      @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
      gatewayNotificationId: number;
    
      @Column({ type: 'int', nullable: true })
      id: number;
    
      @Column({ type: 'enum', nullable: true, enum: ID_TYPE })
      eIdType: ID_TYPE;
    
      @Column({ type: 'enum', nullable: true, enum: NOTIFICATION_TYPE })
      eNotificationType: NOTIFICATION_TYPE;
    
      @Column({ type: 'enum', nullable: true, enum: NOTIFICATION_STATUS })
      eNotificationStatus: NOTIFICATION_STATUS;
    
      @CreateDateColumn({ type: 'timestamp', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
      createdAt: Date;
    
      @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
      updatedAt: Date;
    
    }
