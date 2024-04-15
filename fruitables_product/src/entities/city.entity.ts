    import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
    
    enum STATUS {
      ACTIVE = 'Active',
      INACTIVE = 'Inactive',
    }

    @Entity('mod_city')
    export class CityEntity {
    
      @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
      id: number;
    
      @Column({ type: 'varchar', length: 255 })
      city: string;
    
      @Column({ type: 'varchar', nullable: true, length: 20 })
      cityCode: string;
    
      @Column({ type: 'int', nullable: true, default: '0' })
      stateId: number;
    
      @Column({ type: 'int', nullable: true })
      countryId: number;
    
      @Column({ type: 'varchar', nullable: true, length: 255 })
      latitude: string;
    
      @Column({ type: 'varchar', nullable: true, length: 255 })
      longitude: string;
    
      @Column({ type: 'enum', nullable: true, enum: STATUS, default: STATUS.ACTIVE })
      status: STATUS;
    
      @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
      createdAt: Date;
    
      @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
      updatedAt: Date;
    
    }
