    import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
    

    @Entity('cart')
    export class CartEntity {
    
      @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
      id: number;
    
      @Column({ type: 'int', nullable: true })
      iUserId: number;
    
      @Column({ type: 'int', nullable: true })
      iProductsCount: number;
    
      @Column({ type: 'float', nullable: true, precision: 8, scale: 2 })
      fCost: number;
    
      @Column({ type: 'float', nullable: true, precision: 8, scale: 2 })
      fShippingCost: number;
    
      @Column({ type: 'float', nullable: true, precision: 8, scale: 2 })
      fTotalCost: number;
    
      @CreateDateColumn({ type: 'timestamp', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
      createdAt: Date;
    
      @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
      updatedAt: Date;
    
    }
