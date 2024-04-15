import { Controller, UseFilters, Post, Req, Request, Body, Delete, Param, Get, Query, Put, BadRequestException, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { validate } from 'class-validator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { HttpExceptionFilter } from 'src/filters/http-exception.filter';
import { CitGeneralLibrary } from 'src/utilities/cit-general-library';
import { AdminAddExtendedService } from './services/extended/admin_add.extended.service';
import { AdminChangeStatusExtendedService } from './services/extended/admin_change_status.extended.service';
import { AdminDeleteExtendedService } from './services/extended/admin_delete.extended.service';
import { AdminDetailsExtendedService } from './services/extended/admin_details.extended.service';
import { AdminIdentityExtendedService } from './services/extended/admin_identity.extended.service';
import { AdminListExtendedService } from './services/extended/admin_list.extended.service';
import { AdminProfileUpdateService } from './services/admin_profile_update.service';
import { AdminUpdateExtendedService } from './services/extended/admin_update.extended.service';
import { CheckAdminEmailService } from './services/check_admin_email.service';
import { CheckCustomerEmailService } from './services/check_customer_email.service';
import { CustomerAddExtendedService } from './services/extended/customer_add.extended.service';
import { CustomerChangeStatusService } from './services/customer_change_status.service';
import { CustomerDeleteService } from './services/customer_delete.service';
import { CustomerDetailsService } from './services/customer_details.service';
import { CustomerListExtendedService } from './services/extended/customer_list.extended.service';
import { CustomerUpdateService } from './services/customer_update.service';
import { GetCustomerDetailsService } from './services/get_customer_details.service';
import { GroupCapabilityListService } from './services/group_capability_list.service';
import { GroupCapabilityUpdateExtendedService } from './services/extended/group_capability_update.extended.service';
import { UpdateCustomerDetailsService } from './services/update_customer_details.service';
import { UpdateCustomerProfileImageService } from './services/update_customer_profile_image.service';
import { AdminAddDto } from './dto/admin_add.dto';
import { AdminChangeStatusDto } from './dto/admin_change_status.dto';
import { AdminDeleteDto, AdminDeleteParamDto } from './dto/admin_delete.dto';
import { AdminDetailsDto, AdminDetailsParamDto } from './dto/admin_details.dto';
import { AdminListDto } from './dto/admin_list.dto';
import { AdminProfileUpdateDto } from './dto/admin_profile_update.dto';
import { AdminUpdateDto, AdminUpdateParamDto } from './dto/admin_update.dto';
import { CheckAdminEmailDto } from './dto/check_admin_email.dto';
import { CheckCustomerEmailDto } from './dto/check_customer_email.dto';
import { CustomerAddDto, CustomerAddFileDto } from './dto/customer_add.dto';
import { CustomerChangeStatusDto } from './dto/customer_change_status.dto';
import { CustomerDeleteDto, CustomerDeleteParamDto } from './dto/customer_delete.dto';
import { CustomerDetailsDto, CustomerDetailsParamDto } from './dto/customer_details.dto';
import { CustomerListDto } from './dto/customer_list.dto';
import { CustomerUpdateDto, CustomerUpdateParamDto, CustomerUpdateFileDto } from './dto/customer_update.dto';
import { GroupCapabilityUpdateDto, GroupCapabilityUpdateParamDto } from './dto/group_capability_update.dto';
import { UpdateCustomerDetailsDto } from './dto/update_customer_details.dto';
import { UpdateCustomerProfileImageDto, UpdateCustomerProfileImageFileDto } from './dto/update_customer_profile_image.dto';

@Controller()
@UseFilters(HttpExceptionFilter)
export class UserController {
  constructor(
    protected readonly general: CitGeneralLibrary,
    private adminAddService: AdminAddExtendedService,
    private adminChangeStatusService: AdminChangeStatusExtendedService,
    private adminDeleteService: AdminDeleteExtendedService,
    private adminDetailsService: AdminDetailsExtendedService,
    private adminIdentityService: AdminIdentityExtendedService,
    private adminListService: AdminListExtendedService,
    private adminProfileUpdateService: AdminProfileUpdateService,
    private adminUpdateService: AdminUpdateExtendedService,
    private checkAdminEmailService: CheckAdminEmailService,
    private checkCustomerEmailService: CheckCustomerEmailService,
    private customerAddService: CustomerAddExtendedService,
    private customerChangeStatusService: CustomerChangeStatusService,
    private customerDeleteService: CustomerDeleteService,
    private customerDetailsService: CustomerDetailsService,
    private customerListService: CustomerListExtendedService,
    private customerUpdateService: CustomerUpdateService,
    private getCustomerDetailsService: GetCustomerDetailsService,
    private groupCapabilityListService: GroupCapabilityListService,
    private groupCapabilityUpdateService: GroupCapabilityUpdateExtendedService,
    private updateCustomerDetailsService: UpdateCustomerDetailsService,
    private updateCustomerProfileImageService: UpdateCustomerProfileImageService,
  ) {}

  @Post('admin')
  async adminAdd(@Req() request: Request, @Body() body: AdminAddDto) {
    const params = body;
    return await this.adminAddService.startAdminAdd(request, params);
  }

  @Post('admin-change-status')
  async adminChangeStatus(@Req() request: Request, @Body() body: AdminChangeStatusDto) {
    const params = body;
    return await this.adminChangeStatusService.startAdminChangeStatus(request, params);
  }

  @Delete('admin/:id')
  async adminDelete(@Req() request: Request, @Param() param: AdminDeleteParamDto, @Body() body: AdminDeleteDto) {
    const params = { ...param, ...body };
    return await this.adminDeleteService.startAdminDelete(request, params);
  }

  @Get('admin/:id')
  async adminDetails(@Req() request: Request, @Param() param: AdminDetailsParamDto, @Query() query: AdminDetailsDto) {
    const params = { ...param, ...query };
    return await this.adminDetailsService.startAdminDetails(request, params);
  }

  @Get('identity')
  async adminIdentity(@Req() request: Request, @Query() query) {
    const params = { ...query };
    return await this.adminIdentityService.startAdminIdentity(request, params);
  }

  @Post('admin-list')
  async adminList(@Req() request: Request, @Body() body: AdminListDto) {
    const params = body;
    return await this.adminListService.startAdminList(request, params);
  }

  @Put('admin-profile-update')
  async adminProfileUpdate(@Req() request: Request, @Body() body: AdminProfileUpdateDto) {
    const params = body;
    return await this.adminProfileUpdateService.startAdminProfileUpdate(request, params);
  }

  @Put('admin/:id')
  async adminUpdate(@Req() request: Request, @Param() param: AdminUpdateParamDto, @Body() body: AdminUpdateDto) {
    const params = { ...param, ...body };
    return await this.adminUpdateService.startAdminUpdate(request, params);
  }

  @Post('check-admin-email')
  async checkAdminEmail(@Req() request: Request, @Body() body: CheckAdminEmailDto) {
    const params = body;
    return await this.checkAdminEmailService.startCheckAdminEmail(request, params);
  }

  @Post('check-customer-email')
  async checkCustomerEmail(@Req() request: Request, @Body() body: CheckCustomerEmailDto) {
    const params = body;
    return await this.checkCustomerEmailService.startCheckCustomerEmail(request, params);
  }

  @Post('customer')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'profile_image' },
  ]))
  async customerAdd(@Req() request: Request, @Body() body: CustomerAddDto, @UploadedFiles() files: Record<string, Express.Multer.File[]>) {
    const params = body;

    const fileDto = new CustomerAddFileDto();
    fileDto.profile_image = files?.profile_image;
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

    return await this.customerAddService.startCustomerAdd(request, params);
  }

  @Post('customer-change-status')
  async customerChangeStatus(@Req() request: Request, @Body() body: CustomerChangeStatusDto) {
    const params = body;
    return await this.customerChangeStatusService.startCustomerChangeStatus(request, params);
  }

  @Delete('customer/:id')
  async customerDelete(@Req() request: Request, @Param() param: CustomerDeleteParamDto, @Body() body: CustomerDeleteDto) {
    const params = { ...param, ...body };
    return await this.customerDeleteService.startCustomerDelete(request, params);
  }

  @Get('customer/:id')
  async customerDetails(@Req() request: Request, @Param() param: CustomerDetailsParamDto, @Query() query: CustomerDetailsDto) {
    const params = { ...param, ...query };
    return await this.customerDetailsService.startCustomerDetails(request, params);
  }

  @Post('customer-list')
  async customerList(@Req() request: Request, @Body() body: CustomerListDto) {
    const params = body;
    return await this.customerListService.startCustomerList(request, params);
  }

  @Put('customer/:id')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'profile_image' },
  ]))
  async customerUpdate(@Req() request: Request, @Param() param: CustomerUpdateParamDto, @Body() body: CustomerUpdateDto, @UploadedFiles() files: Record<string, Express.Multer.File[]>) {
    const params = { ...param, ...body };

    const fileDto = new CustomerUpdateFileDto();
    fileDto.profile_image = files?.profile_image;
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

    return await this.customerUpdateService.startCustomerUpdate(request, params);
  }

  @Get('customer-profile')
  async getCustomerDetails(@Req() request: Request, @Query() query) {
    const params = { ...query };
    return await this.getCustomerDetailsService.startGetCustomerDetails(request, params);
  }

  @Get('group-capability-list')
  async groupCapabilityList(@Req() request: Request, @Query() query) {
    const params = { ...query };
    return await this.groupCapabilityListService.startGroupCapabilityList(request, params);
  }

  @Put('group-capability-update/:id')
  async groupCapabilityUpdate(@Req() request: Request, @Param() param: GroupCapabilityUpdateParamDto, @Body() body: GroupCapabilityUpdateDto) {
    const params = { ...param, ...body };
    return await this.groupCapabilityUpdateService.startGroupCapabilityUpdate(request, params);
  }

  @Post('customer-profile')
  async updateCustomerDetails(@Req() request: Request, @Body() body: UpdateCustomerDetailsDto) {
    const params = body;
    return await this.updateCustomerDetailsService.startUpdateCustomerDetails(request, params);
  }

  @Post('profile-image')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'profile_image' },
  ]))
  async updateCustomerProfileImage(@Req() request: Request, @Body() body: UpdateCustomerProfileImageDto, @UploadedFiles() files: Record<string, Express.Multer.File[]>) {
    const params = body;

    const fileDto = new UpdateCustomerProfileImageFileDto();
    fileDto.profile_image = files?.profile_image;
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

    return await this.updateCustomerProfileImageService.startUpdateCustomerProfileImage(request, params);
  }

}
