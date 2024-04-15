    import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
    
    enum STATUS {
      ACTIVE = 'Active',
      INACTIVE = 'Inactive',
    }

    @Entity('mod_admin_passwords')
    export class AdminPasswordsEntity {
    
      @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
      id: number;
    
      @Column({ type: 'int' })
      adminId: number;
    
      @Column({ type: 'varchar', length: 255 })
      password: string;
    
      @Column({ type: 'enum', nullable: true, enum: STATUS, default: STATUS.ACTIVE })
      status: STATUS;
    
      @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
      createdAt: Date;
    
      @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
      updatedAt: Date;
    
    }
