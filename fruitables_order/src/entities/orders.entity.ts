    import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
    
    enum STATUS {
      PLACED = 'PLACED',
      DISPATHED = 'DISPATHED',
      OUTOFDELIVERY = 'OUTOFDELIVERY',
      DELIVERED = 'DELIVERED',
      CANCELLED = 'CANCELLED',
    }

    @Entity('orders')
    export class OrdersEntity {
    
      @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
      id: number;
    
      @Column({ type: 'int', nullable: true })
      iUserId: number;
    
      @Column({ type: 'int', nullable: true })
      iUserAddressId: number;
    
      @Column({ type: 'int', nullable: true })
      iItemCount: number;
    
      @Column({ type: 'float', nullable: true, precision: 8, scale: 2 })
      fCost: number;
    
      @Column({ type: 'float', nullable: true, precision: 8, scale: 2 })
      fShippingCost: number;
    
      @Column({ type: 'float', nullable: true, precision: 8, scale: 2 })
      fTotalCost: number;
    
      @Column({ type: 'enum', nullable: true, enum: STATUS })
      eStatus: STATUS;
    
      @CreateDateColumn({ type: 'timestamp', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
      createdAt: Date;
    
      @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
      updatedAt: Date;
    
    }
