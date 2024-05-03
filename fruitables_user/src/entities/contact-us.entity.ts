    import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
    

    @Entity('contact_us')
    export class ContactUsEntity {
    
      @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
      id: number;
    
      @Column({ type: 'varchar', nullable: true, length: 255 })
      vName: string;
    
      @Column({ type: 'varchar', nullable: true, length: 255 })
      vEmail: string;
    
      @Column({ type: 'varchar', nullable: true, length: 255 })
      vMessage: string;
    
      @Column({ type: 'int', nullable: true })
      iCount: number;
    
      @CreateDateColumn({ type: 'timestamp', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
      createdAt: Date;
    
      @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
      updatedAt: Date;
    
    }
