    import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
    
    enum STATUS {
      ACTIVE = 'Active',
      INACTIVE = 'Inactive',
    }

    @Entity('mod_capability_category')
    export class CapabilityCategoryEntity {
    
      @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
      id: number;
    
      @Column({ type: 'varchar', nullable: true, length: 255 })
      categoryName: string;
    
      @Column({ type: 'varchar', nullable: true, length: 255 })
      categoryCode: string;
    
      @Column({ type: 'enum', nullable: true, enum: STATUS, default: STATUS.ACTIVE })
      status: STATUS;
    
      @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
      createdAt: Date;
    
      @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
      updatedAt: Date;
    
    }
