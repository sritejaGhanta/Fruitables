    import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
    
    enum OPEN {
      SAME = 'same',
      NEW = 'new',
      POPUP_IFRAME = 'popup_iframe',
      POPUP_AJAX = 'popup_ajax',
    }
    enum MENU_TYPE {
      CUSTOM = 'Custom',
      MODULE = 'Module',
      DASHBOARD = 'Dashboard',
    }
    enum STATUS {
      ACTIVE = 'Active',
      INACTIVE = 'Inactive',
      HIDDEN = 'Hidden',
    }

    @Entity('mod_admin_menu')
    export class AdminMenuEntity {
    
      @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
      id: number;
    
      @Column({ type: 'int', nullable: true })
      parentId: number;
    
      @Column({ type: 'varchar', length: 255 })
      menuDisplay: string;
    
      @Column({ type: 'varchar', nullable: true, length: 255 })
      icon: string;
    
      @Column({ type: 'varchar', nullable: true, length: 255 })
      url: string;
    
      @Column({ type: 'enum', nullable: true, enum: OPEN, default: OPEN.SAME })
      open: OPEN;
    
      @Column({ type: 'enum', nullable: true, enum: MENU_TYPE, default: MENU_TYPE.MODULE })
      menuType: MENU_TYPE;
    
      @Column({ type: 'int', nullable: true })
      capabilityId: number;
    
      @Column({ type: 'varchar', nullable: true, length: 255 })
      capabilityCode: string;
    
      @Column({ type: 'varchar', nullable: true, length: 255 })
      moduleName: string;
    
      @Column({ type: 'varchar', nullable: true, length: 255 })
      dashBoardPage: string;
    
      @Column({ type: 'varchar', nullable: true, length: 500 })
      uniqueMenuCode: string;
    
      @Column({ type: 'int', nullable: true, default: '1' })
      columnNumber: number;
    
      @Column({ type: 'int', nullable: true, default: '1' })
      sequenceOrder: number;
    
      @Column({ type: 'enum', nullable: true, enum: STATUS })
      status: STATUS;
    
      @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
      createdAt: Date;
    
      @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
      updatedAt: Date;
    
    }
