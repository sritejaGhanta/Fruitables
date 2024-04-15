    import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
    
    enum STATUS {
      ACTIVE = 'Active',
      INACTIVE = 'Inactive',
    }

    @Entity('mod_country')
    export class CountryEntity {
    
      @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
      id: number;
    
      @Column({ type: 'varchar', length: 255 })
      country: string;
    
      @Column({ type: 'char' })
      countryCode: string;
    
      @Column({ type: 'char', nullable: true })
      countryCodeISO3: string;
    
      @Column({ type: 'varchar', nullable: true, length: 255 })
      countryFlag: string;
    
      @Column({ type: 'varchar', nullable: true, length: 10 })
      dialCode: string;
    
      @Column({ type: 'text', nullable: true })
      description: string;
    
      @Column({ type: 'enum', nullable: true, enum: STATUS })
      status: STATUS;
    
      @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
      createdAt: Date;
    
      @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
      updatedAt: Date;
    
    }
