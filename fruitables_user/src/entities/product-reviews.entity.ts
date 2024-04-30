    import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
    

    @Entity('product_reviews')
    export class ProductReviewsEntity {
    
      @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
      id: number;
    
      @Column({ type: 'int', nullable: true })
      iProductId: number;
    
      @Column({ type: 'int', nullable: true })
      iUserId: number;
    
      @Column({ type: 'text', nullable: true })
      tReview: string;
    
      @Column({ type: 'float', nullable: true, precision: 8, scale: 2 })
      fRating: number;
    
      @CreateDateColumn({ type: 'timestamp', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
      createdAt: Date;
    
      @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
      updatedAt: Date;
    
    }
