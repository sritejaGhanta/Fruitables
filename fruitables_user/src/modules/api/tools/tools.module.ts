import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GlobalModule } from 'src/modules/global/global.module';
import { ToolsController } from './tools.controller';

import { CityAddService } from './services/city_add.service';
import { CityChangeStatusService } from './services/city_change_status.service';
import { CityDeleteService } from './services/city_delete.service';
import { CityDetailsService } from './services/city_details.service';
import { CityListExtendedService } from './services/extended/city_list.extended.service';
import { CityUpdateService } from './services/city_update.service';
import { CountryAddService } from './services/country_add.service';
import { CountryChangeStatusService } from './services/country_change_status.service';
import { CountryDeleteService } from './services/country_delete.service';
import { CountryDetailsService } from './services/country_details.service';
import { CountryListExtendedService } from './services/extended/country_list.extended.service';
import { CountryUpdateService } from './services/country_update.service';
import { GeneralSettingsExtendedService } from './services/extended/general_settings.extended.service';
import { GetCountryDialCodesService } from './services/get_country_dial_codes.service';
import { GetCountryListService } from './services/get_country_list.service';
import { GetStateListService } from './services/get_state_list.service';
import { SettingsExtendedService } from './services/extended/settings.extended.service';
import { SettingsUpdateExtendedService } from './services/extended/settings_update.extended.service';
import { SettingsUploadFilesExtendedService } from './services/extended/settings_upload_files.extended.service';
import { StateAddService } from './services/state_add.service';
import { StateDeleteService } from './services/state_delete.service';
import { StateDetailsService } from './services/state_details.service';
import { StateListExtendedService } from './services/extended/state_list.extended.service';
import { StateUpdateService } from './services/state_update.service';

import { StateEntity } from 'src/entities/state.entity';
import { CityEntity } from 'src/entities/city.entity';
import { CountryEntity } from 'src/entities/country.entity';
import { SettingEntity } from 'src/entities/setting.entity';

@Module({
  imports: [
    GlobalModule,
    TypeOrmModule.forFeature([
      StateEntity,
      CityEntity,
      CountryEntity,
      SettingEntity,
    ])
  ],
  controllers: [ToolsController],
  providers: [
    CityAddService,
    CityChangeStatusService,
    CityDeleteService,
    CityDetailsService,
    CityListExtendedService,
    CityUpdateService,
    CountryAddService,
    CountryChangeStatusService,
    CountryDeleteService,
    CountryDetailsService,
    CountryListExtendedService,
    CountryUpdateService,
    GeneralSettingsExtendedService,
    GetCountryDialCodesService,
    GetCountryListService,
    GetStateListService,
    SettingsExtendedService,
    SettingsUpdateExtendedService,
    SettingsUploadFilesExtendedService,
    StateAddService,
    StateDeleteService,
    StateDetailsService,
    StateListExtendedService,
    StateUpdateService,
  ]
})
export default class ToolsModule {}
