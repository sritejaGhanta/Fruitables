    import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
    

    @Entity('cart_item')
    export class CartItemEntity {
    
      @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
      id: number;
    
      @Column({ type: 'int', nullable: true })
      iCartId: number;
    
      @Column({ type: 'int', nullable: true })
      iProductId: number;
    
      @Column({ type: 'int', nullable: true })
      iProductQty: number;
    
      @CreateDateColumn({ type: 'timestamp', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
      createdAt: Date;
    
      @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
      updatedAt: Date;
    
    }
