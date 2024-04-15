import { Controller, UseFilters, Post, Req, Request, Body, Delete, Param, Get, Query, Put, UseInterceptors, BadRequestException, UploadedFiles } from '@nestjs/common';
import { validate } from 'class-validator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { HttpExceptionFilter } from 'src/filters/http-exception.filter';
import { CitGeneralLibrary } from 'src/utilities/cit-general-library';
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
import { CityAddDto } from './dto/city_add.dto';
import { CityChangeStatusDto } from './dto/city_change_status.dto';
import { CityDeleteDto, CityDeleteParamDto } from './dto/city_delete.dto';
import { CityDetailsDto, CityDetailsParamDto } from './dto/city_details.dto';
import { CityListDto } from './dto/city_list.dto';
import { CityUpdateDto, CityUpdateParamDto } from './dto/city_update.dto';
import { CountryAddDto } from './dto/country_add.dto';
import { CountryChangeStatusDto } from './dto/country_change_status.dto';
import { CountryDeleteDto, CountryDeleteParamDto } from './dto/country_delete.dto';
import { CountryDetailsDto, CountryDetailsParamDto } from './dto/country_details.dto';
import { CountryListDto } from './dto/country_list.dto';
import { CountryUpdateDto, CountryUpdateParamDto } from './dto/country_update.dto';
import { GeneralSettingsDto } from './dto/general_settings.dto';
import { GetCountryDialCodesDto } from './dto/get_country_dial_codes.dto';
import { GetCountryListDto } from './dto/get_country_list.dto';
import { GetStateListDto } from './dto/get_state_list.dto';
import { SettingsDto } from './dto/settings.dto';
import { SettingsUpdateDto } from './dto/settings_update.dto';
import { SettingsUploadFilesDto, SettingsUploadFilesFileDto } from './dto/settings_upload_files.dto';
import { StateAddDto } from './dto/state_add.dto';
import { StateDeleteDto, StateDeleteParamDto } from './dto/state_delete.dto';
import { StateDetailsDto, StateDetailsParamDto } from './dto/state_details.dto';
import { StateListDto } from './dto/state_list.dto';
import { StateUpdateDto, StateUpdateParamDto } from './dto/state_update.dto';

@Controller()
@UseFilters(HttpExceptionFilter)
export class ToolsController {
  constructor(
    protected readonly general: CitGeneralLibrary,
    private cityAddService: CityAddService,
    private cityChangeStatusService: CityChangeStatusService,
    private cityDeleteService: CityDeleteService,
    private cityDetailsService: CityDetailsService,
    private cityListService: CityListExtendedService,
    private cityUpdateService: CityUpdateService,
    private countryAddService: CountryAddService,
    private countryChangeStatusService: CountryChangeStatusService,
    private countryDeleteService: CountryDeleteService,
    private countryDetailsService: CountryDetailsService,
    private countryListService: CountryListExtendedService,
    private countryUpdateService: CountryUpdateService,
    private generalSettingsService: GeneralSettingsExtendedService,
    private getCountryDialCodesService: GetCountryDialCodesService,
    private getCountryListService: GetCountryListService,
    private getStateListService: GetStateListService,
    private settingsService: SettingsExtendedService,
    private settingsUpdateService: SettingsUpdateExtendedService,
    private settingsUploadFilesService: SettingsUploadFilesExtendedService,
    private stateAddService: StateAddService,
    private stateDeleteService: StateDeleteService,
    private stateDetailsService: StateDetailsService,
    private stateListService: StateListExtendedService,
    private stateUpdateService: StateUpdateService,
  ) {}

  @Post('city')
  async cityAdd(@Req() request: Request, @Body() body: CityAddDto) {
    const params = body;
    return await this.cityAddService.startCityAdd(request, params);
  }

  @Post('city-change-status')
  async cityChangeStatus(@Req() request: Request, @Body() body: CityChangeStatusDto) {
    const params = body;
    return await this.cityChangeStatusService.startCityChangeStatus(request, params);
  }

  @Delete('city/:id')
  async cityDelete(@Req() request: Request, @Param() param: CityDeleteParamDto, @Body() body: CityDeleteDto) {
    const params = { ...param, ...body };
    return await this.cityDeleteService.startCityDelete(request, params);
  }

  @Get('city/:id')
  async cityDetails(@Req() request: Request, @Param() param: CityDetailsParamDto, @Query() query: CityDetailsDto) {
    const params = { ...param, ...query };
    return await this.cityDetailsService.startCityDetails(request, params);
  }

  @Post('city-list')
  async cityList(@Req() request: Request, @Body() body: CityListDto) {
    const params = body;
    return await this.cityListService.startCityList(request, params);
  }

  @Put('city/:id')
  async cityUpdate(@Req() request: Request, @Param() param: CityUpdateParamDto, @Body() body: CityUpdateDto) {
    const params = { ...param, ...body };
    return await this.cityUpdateService.startCityUpdate(request, params);
  }

  @Post('country')
  async countryAdd(@Req() request: Request, @Body() body: CountryAddDto) {
    const params = body;
    return await this.countryAddService.startCountryAdd(request, params);
  }

  @Post('country-change-status')
  async countryChangeStatus(@Req() request: Request, @Body() body: CountryChangeStatusDto) {
    const params = body;
    return await this.countryChangeStatusService.startCountryChangeStatus(request, params);
  }

  @Delete('country/:id')
  async countryDelete(@Req() request: Request, @Param() param: CountryDeleteParamDto, @Body() body: CountryDeleteDto) {
    const params = { ...param, ...body };
    return await this.countryDeleteService.startCountryDelete(request, params);
  }

  @Get('country/:id')
  async countryDetails(@Req() request: Request, @Param() param: CountryDetailsParamDto, @Query() query: CountryDetailsDto) {
    const params = { ...param, ...query };
    return await this.countryDetailsService.startCountryDetails(request, params);
  }

  @Post('country-list')
  async countryList(@Req() request: Request, @Body() body: CountryListDto) {
    const params = body;
    return await this.countryListService.startCountryList(request, params);
  }

  @Put('country/:id')
  async countryUpdate(@Req() request: Request, @Param() param: CountryUpdateParamDto, @Body() body: CountryUpdateDto) {
    const params = { ...param, ...body };
    return await this.countryUpdateService.startCountryUpdate(request, params);
  }

  @Get('general-settings')
  async generalSettings(@Req() request: Request, @Query() query: GeneralSettingsDto) {
    const params = { ...query };
    return await this.generalSettingsService.startGeneralSettings(request, params);
  }

  @Get('dial-codes')
  async getCountryDialCodes(@Req() request: Request, @Query() query: GetCountryDialCodesDto) {
    const params = { ...query };
    return await this.getCountryDialCodesService.startGetCountryDialCodes(request, params);
  }

  @Get('countries')
  async getCountryList(@Req() request: Request, @Query() query: GetCountryListDto) {
    const params = { ...query };
    return await this.getCountryListService.startGetCountryList(request, params);
  }

  @Get('country-states')
  async getStateList(@Req() request: Request, @Query() query: GetStateListDto) {
    const params = { ...query };
    return await this.getStateListService.startGetStateList(request, params);
  }

  @Get('settings')
  async settings(@Req() request: Request, @Query() query: SettingsDto) {
    const params = { ...query };
    return await this.settingsService.startSettings(request, params);
  }

  @Put('settings-update')
  async settingsUpdate(@Req() request: Request, @Body() body: SettingsUpdateDto) {
    const params = body;
    return await this.settingsUpdateService.startSettingsUpdate(request, params);
  }

  @Post('settings-upload-files')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'setting_file' },
  ]))
  async settingsUploadFiles(@Req() request: Request, @Body() body: SettingsUploadFilesDto, @UploadedFiles() files: Record<string, Express.Multer.File[]>) {
    const params = body;

    const fileDto = new SettingsUploadFilesFileDto();
    fileDto.setting_file = files?.setting_file;
    const errors = await validate(fileDto, { whitelist: true });

    if (errors.length > 0) {
      const errorMessages = errors
        .map((error) => {
          if (error.hasOwnProperty('constraints')) {
            return Object.values(error.constraints);
          } else {
            return [];
          }
        })
        .flat();
      if (errorMessages.length > 0) {
        const response = {
          statusCode: 400,
          message: 'Validation failed',
          errors: errorMessages,
        };
        throw new BadRequestException(response);
      }
    }

    const uploadPromises = [];
    if (typeof files !== 'undefined' && Object.keys(files).length > 0) {
      for (const [key, value] of Object.entries(files)) {
        const fieldFiles = files[key];
        for (const file of fieldFiles) {
          const fileName = await this.general.temporaryUpload(file);
          uploadPromises.push(fileName);
          params[key] = fileName;
        }
      }
    }
    await Promise.all(uploadPromises);

    return await this.settingsUploadFilesService.startSettingsUploadFiles(request, params);
  }

  @Post('state')
  async stateAdd(@Req() request: Request, @Body() body: StateAddDto) {
    const params = body;
    return await this.stateAddService.startStateAdd(request, params);
  }

  @Delete('state/:id')
  async stateDelete(@Req() request: Request, @Param() param: StateDeleteParamDto, @Body() body: StateDeleteDto) {
    const params = { ...param, ...body };
    return await this.stateDeleteService.startStateDelete(request, params);
  }

  @Get('state/:id')
  async stateDetails(@Req() request: Request, @Param() param: StateDetailsParamDto, @Query() query: StateDetailsDto) {
    const params = { ...param, ...query };
    return await this.stateDetailsService.startStateDetails(request, params);
  }

  @Post('state-list')
  async stateList(@Req() request: Request, @Body() body: StateListDto) {
    const params = body;
    return await this.stateListService.startStateList(request, params);
  }

  @Put('state/:id')
  async stateUpdate(@Req() request: Request, @Param() param: StateUpdateParamDto, @Body() body: StateUpdateDto) {
    const params = { ...param, ...body };
    return await this.stateUpdateService.startStateUpdate(request, params);
  }

}
