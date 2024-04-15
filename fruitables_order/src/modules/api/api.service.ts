import { Injectable } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as _ from 'lodash';
import { SettingEntity } from 'src/entities/setting.entity';
import { LoggerHandler } from 'src/utilities/logger-handler';

@Injectable()
export class ApiService {
  protected readonly log = new LoggerHandler(ApiService.name).getInstance();

  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(SettingEntity)
    protected settingEntity: Repository<SettingEntity>,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async syncSettings() {
    try {
      const queryObject = this.settingEntity.createQueryBuilder('ms');
      queryObject.select('ms.name, ms.value');
      queryObject.where('ms.status = :status', { status: 'Active' });
      const data = await queryObject.execute();

      if (!_.isArray(data) || _.isEmpty(data)) {
        throw new Error('No settings data found');
      }
      return data;
    } catch (err) {
      this.log.error(err);
    }
    return [];
  }
}
