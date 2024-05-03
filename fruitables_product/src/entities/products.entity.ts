    import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
    
    enum STATUS {
      ACTIVE = 'Active',
      INACTIVE = 'Inactive',
    }
    enum OFFER_TYPE {
      FREE_DELIVERY = 'free_delivery',
      DISCOUNT = 'discount',
    }

    @Entity('products')
    export class ProductsEntity {
    
      @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
      id: number;
    
      @Column({ type: 'int', nullable: true })
      iProductCategoryId: number;
    
      @Column({ type: 'varchar', nullable: true, length: 255 })
      vProductName: string;
    
      @Column({ type: 'varchar', nullable: true, length: 255 })
      vProductImage: string;
    
      @Column({ type: 'float', nullable: true, precision: 8, scale: 2 })
      fProductCost: number;
    
      @Column({ type: 'varchar', nullable: true, length: 255 })
      vProductDescription: string;
    
      @Column({ type: 'float', nullable: true, precision: 8, scale: 2 })
      fRating: number;
    
      @Column({ type: 'enum', nullable: true, enum: STATUS })
      eStatus: STATUS;
    
      @Column({ type: 'enum', nullable: true, enum: OFFER_TYPE })
      eOfferType: OFFER_TYPE;
    
      @CreateDateColumn({ type: 'timestamp', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
      createdAt: Date;
    
      @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
      updatedAt: Date;
    
    }
