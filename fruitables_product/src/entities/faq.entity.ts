    import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
    

    @Entity('faq')
    export class FaqEntity {
    
      @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
      id: number;
    
      @Column({ type: 'int', nullable: true })
      iProductId: number;
    
      @Column({ type: 'varchar', nullable: true, length: 255 })
      vQuestionName: string;
    
      @Column({ type: 'varchar', nullable: true, length: 255 })
      vAnswer: string;
    
      @CreateDateColumn({ type: 'timestamp', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
      createdAt: Date;
    
      @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
      updatedAt: Date;
    
    }
