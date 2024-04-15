    import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
    
    enum CONFIG_TYPE {
      COMPANY = 'Company',
      APPEARANCE = 'Appearance',
      PREFERENCES = 'Preferences',
      EMAIL = 'Email',
      SMS = 'SMS',
      PUSHNOTIFY = 'PushNotify',
      CONFIG = 'Config',
      FORMATS = 'Formats',
      AUTHENTICATE = 'Authenticate',
      META = 'Meta',
    }
    enum DISPLAY_TYPE {
      TEXT = 'text',
      SELECTBOX = 'selectbox',
      TEXTAREA = 'textarea',
      CHECKBOX = 'checkbox',
      RADIO = 'radio',
      HIDDEN = 'hidden',
      EDITOR = 'editor',
      FILE = 'file',
      READONLY = 'readonly',
      PASSWORD = 'password',
    }
    enum SOURCE {
      LIST = 'List',
      QUERY = 'Query',
      VALUE = 'Value',
      PERCENT = 'Percent',
      FUNCTION = 'Function',
      NOIMAGE = 'NoImage',
    }
    enum SELECT_TYPE {
      SINGLE = 'Single',
      MULTIPLE = 'Multiple',
      PLUS = 'Plus',
      MINUS = 'Minus',
    }
    enum LANG {
      YES = 'Yes',
      NO = 'No',
    }
    enum STATUS {
      ACTIVE = 'Active',
      INACTIVE = 'Inactive',
    }

    @Entity('mod_setting')
    export class SettingEntity {
    
      @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
      id: number;
    
      @Column({ type: 'varchar', length: 255 })
      name: string;
    
      @Column({ type: 'varchar', nullable: true, length: 255 })
      desc: string;
    
      @Column({ type: 'text', nullable: true })
      value: string;
    
      @Column({ type: 'text', nullable: true })
      groupType: string;
    
      @Column({ type: 'enum', nullable: true, enum: CONFIG_TYPE })
      configType: CONFIG_TYPE;
    
      @Column({ type: 'enum', nullable: true, enum: DISPLAY_TYPE })
      displayType: DISPLAY_TYPE;
    
      @Column({ type: 'enum', nullable: true, enum: SOURCE })
      source: SOURCE;
    
      @Column({ type: 'text', nullable: true })
      sourceValue: string;
    
      @Column({ type: 'enum', nullable: true, enum: SELECT_TYPE })
      selectType: SELECT_TYPE;
    
      @Column({ type: 'varchar', nullable: true, length: 255 })
      defValue: string;
    
      @Column({ type: 'enum', nullable: true, enum: LANG, default: LANG.NO })
      lang: LANG;
    
      @Column({ type: 'text', nullable: true })
      validateCode: string;
    
      @Column({ type: 'text', nullable: true })
      validateMessage: string;
    
      @Column({ type: 'text', nullable: true })
      settingAttr: string;
    
      @Column({ type: 'varchar', nullable: true, length: 255 })
      placeholder: string;
    
      @Column({ type: 'text', nullable: true })
      helpText: string;
    
      @Column({ type: 'int', default: '0' })
      orderBy: number;
    
      @Column({ type: 'enum', enum: STATUS, default: STATUS.ACTIVE })
      status: STATUS;
    
      @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
      createdAt: Date;
    
      @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
      updatedAt: Date;
    
    }
