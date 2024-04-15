    import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
    
    enum CAPABILITY_TYPE {
      CUSTOM = 'Custom',
      MODULE = 'Module',
      DASHBOARD = 'Dashboard',
      WIDGET = 'Widget',
      LISTFIELD = 'ListField',
      FORMFIELD = 'FormField',
    }
    enum ADDED_BY {
      SYSTEM = 'System',
      MANUAL = 'Manual',
    }
    enum STATUS {
      ACTIVE = 'Active',
      INACTIVE = 'Inactive',
    }

    @Entity('mod_capability_master')
    export class CapabilityMasterEntity {
    
      @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
      id: number;
    
      @Column({ type: 'varchar', nullable: true, length: 255 })
      capabilityName: string;
    
      @Column({ type: 'varchar', nullable: true, length: 255 })
      capabilityCode: string;
    
      @Column({ type: 'enum', nullable: true, enum: CAPABILITY_TYPE })
      capabilityType: CAPABILITY_TYPE;
    
      @Column({ type: 'varchar', nullable: true, length: 255 })
      capabilityMode: string;
    
      @Column({ type: 'varchar', nullable: true, length: 255 })
      entityName: string;
    
      @Column({ type: 'varchar', nullable: true, length: 255 })
      parentEntity: string;
    
      @Column({ type: 'int', nullable: true })
      categoryId: number;
    
      @Column({ type: 'enum', nullable: true, enum: ADDED_BY, default: ADDED_BY.SYSTEM })
      addedBy: ADDED_BY;
    
      @Column({ type: 'enum', nullable: true, enum: STATUS, default: STATUS.ACTIVE })
      status: STATUS;
    
      @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
      createdAt: Date;
    
      @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
      updatedAt: Date;
    
    }
