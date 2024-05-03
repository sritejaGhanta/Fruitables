    import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
    
    enum STATUS {
      ACTIVE = 'Active',
      INACTIVE = 'Inactive',
    }

    @Entity('mod_group_master')
    export class GroupMasterEntity {
    
      @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
      id: number;
    
      @Column({ type: 'varchar', length: 255 })
      groupName: string;
    
      @Column({ type: 'varchar', length: 255 })
      groupCode: string;
    
      @Column({ type: 'text', nullable: true })
      groupingAttr: string;
    
      @Column({ type: 'longtext', nullable: true })
      groupCapabilities: string;
    
      @Column({ type: 'enum', nullable: true, enum: STATUS })
      status: STATUS;
    
      @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
      createdAt: Date;
    
      @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
      updatedAt: Date;
    
    }
