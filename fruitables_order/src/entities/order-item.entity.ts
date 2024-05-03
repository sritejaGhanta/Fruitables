    import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
    

    @Entity('order_item')
    export class OrderItemEntity {
    
      @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
      id: number;
    
      @Column({ type: 'int', nullable: true })
      iOrderid: number;
    
      @Column({ type: 'int', nullable: true })
      iProductId: number;
    
      @Column({ type: 'int', nullable: true })
      iOrderQty: number;
    
      @Column({ type: 'float', nullable: true, precision: 8, scale: 2 })
      fPrice: number;
    
      @Column({ type: 'float', nullable: true, precision: 8, scale: 2 })
      fTotalPrice: number;
    
      @CreateDateColumn({ type: 'timestamp', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
      createdAt: Date;
    
      @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
      updatedAt: Date;
    
    }
