import { Controller, UseFilters, Post, Req, Request, Body, Delete, Put, Param, Get, Query, BadRequestException, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { validate } from 'class-validator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { HttpExceptionFilter } from 'src/filters/http-exception.filter';
import { CitGeneralLibrary } from 'src/utilities/cit-general-library';
import { CartItemAddExtendedService } from './services/extended/cart_item_add.extended.service';
import { CartItemDeleteService } from './services/cart_item_delete.service';
import { CartItemListExtendedService } from './services/extended/cart_item_list.extended.service';
import { CartItemUpdateService } from './services/cart_item_update.service';
import { RmqClearCartService } from './services/rmq_clear_cart.service';
import { RmqGetAddressListService } from './services/rmq_get_address_list.service';
import { RmqGetCartItemsDetailsExtendedService } from './services/extended/rmq_get_cart_items_details.extended.service';
import { RmqGetCartDetailsService } from './services/rmq_get_cart_details.service';
import { RmqGetUserAddressService } from './services/rmq_get_user_address.service';
import { RmqGetUserDetailsService } from './services/rmq_get_user_details.service';
import { UserAddService } from './services/user_add.service';
import { UserAddressAddService } from './services/user_address_add.service';
import { UserAddressChangeStatusService } from './services/user_address_change_status.service';
import { UserAddressDeleteService } from './services/user_address_delete.service';
import { UserAddressDetailsService } from './services/user_address_details.service';
import { UserAddressListExtendedService } from './services/extended/user_address_list.extended.service';
import { UserAddressUpdateService } from './services/user_address_update.service';
import { UserAutocompleteService } from './services/user_autocomplete.service';
import { UserChangePasswordService } from './services/user_change_password.service';
import { UserChangeStatusService } from './services/user_change_status.service';
import { UserContactUsService } from './services/user_contact_us.service';
import { UserDetailsService } from './services/user_details.service';
import { UserForgotPasswordExtendedService } from './services/extended/user_forgot_password.extended.service';
import { UserListExtendedService } from './services/extended/user_list.extended.service';
import { UserLoginService } from './services/user_login.service';
import { UserRestPasswordService } from './services/user_rest_password.service';
import { UserUpdateExtendedService } from './services/extended/user_update.extended.service';
import { CartItemAddDto } from './dto/cart_item_add.dto';
import { CartItemDeleteDto } from './dto/cart_item_delete.dto';
import { CartItemUpdateDto, CartItemUpdateParamDto } from './dto/cart_item_update.dto';
import { RmqClearCartDto } from './dto/rmq_clear_cart.dto';
import { RmqGetAddressListDto } from './dto/rmq_get_address_list.dto';
import { RmqGetCartItemsDetailsDto } from './dto/rmq_get_cart_items_details.dto';
import { RmqGetCartDetailsDto } from './dto/rmq_get_cart_details.dto';
import { RmqGetUserAddressDto } from './dto/rmq_get_user_address.dto';
import { RmqGetUserDetailsDto } from './dto/rmq_get_user_details.dto';
import { UserAddDto } from './dto/user_add.dto';
import { UserAddressAddDto } from './dto/user_address_add.dto';
import { UserAddressChangeStatusDto } from './dto/user_address_change_status.dto';
import { UserAddressDeleteDto, UserAddressDeleteParamDto } from './dto/user_address_delete.dto';
import { UserAddressDetailsDto, UserAddressDetailsParamDto } from './dto/user_address_details.dto';
import { UserAddressListDto } from './dto/user_address_list.dto';
import { UserAddressUpdateDto, UserAddressUpdateParamDto } from './dto/user_address_update.dto';
import { UserAutocompleteDto } from './dto/user_autocomplete.dto';
import { UserChangePasswordDto } from './dto/user_change_password.dto';
import { UserChangeStatusDto } from './dto/user_change_status.dto';
import { UserContactUsDto } from './dto/user_contact_us.dto';
import { UserDetailsDto, UserDetailsParamDto } from './dto/user_details.dto';
import { UserForgotPasswordDto } from './dto/user_forgot_password.dto';
import { UserListDto } from './dto/user_list.dto';
import { UserLoginDto } from './dto/user_login.dto';
import { UserRestPasswordDto } from './dto/user_rest_password.dto';
import { UserUpdateDto, UserUpdateParamDto, UserUpdateFileDto } from './dto/user_update.dto';

@Controller()
@UseFilters(HttpExceptionFilter)
export class GatewayUserController {
  constructor(
    protected readonly general: CitGeneralLibrary,
    private cartItemAddService: CartItemAddExtendedService,
    private cartItemDeleteService: CartItemDeleteService,
    private cartItemListService: CartItemListExtendedService,
    private cartItemUpdateService: CartItemUpdateService,
    private rmqClearCartService: RmqClearCartService,
    private rmqGetAddressListService: RmqGetAddressListService,
    private rmqGetCartItemsDetailsService: RmqGetCartItemsDetailsExtendedService,
    private rmqGetCartDetailsService: RmqGetCartDetailsService,
    private rmqGetUserAddressService: RmqGetUserAddressService,
    private rmqGetUserDetailsService: RmqGetUserDetailsService,
    private userAddService: UserAddService,
    private userAddressAddService: UserAddressAddService,
    private userAddressChangeStatusService: UserAddressChangeStatusService,
    private userAddressDeleteService: UserAddressDeleteService,
    private userAddressDetailsService: UserAddressDetailsService,
    private userAddressListService: UserAddressListExtendedService,
    private userAddressUpdateService: UserAddressUpdateService,
    private userAutocompleteService: UserAutocompleteService,
    private userChangePasswordService: UserChangePasswordService,
    private userChangeStatusService: UserChangeStatusService,
    private userContactUsService: UserContactUsService,
    private userDetailsService: UserDetailsService,
    private userForgotPasswordService: UserForgotPasswordExtendedService,
    private userListService: UserListExtendedService,
    private userLoginService: UserLoginService,
    private userRestPasswordService: UserRestPasswordService,
    private userUpdateService: UserUpdateExtendedService,
  ) {}

  @Post('cart-item-add')
  async cartItemAdd(@Req() request: Request, @Body() body: CartItemAddDto) {
    const params = body;
    return await this.cartItemAddService.startCartItemAdd(request, params);
  }

  @Delete('cart-item-delete')
  async cartItemDelete(@Req() request: Request, @Body() body: CartItemDeleteDto) {
    const params = body;
    return await this.cartItemDeleteService.startCartItemDelete(request, params);
  }

  @Post('cart-item-list')
  async cartItemList(@Req() request: Request, @Body() body) {
    const params = body;
    return await this.cartItemListService.startCartItemList(request, params);
  }

  @Put('cart-item-update/:id')
  async cartItemUpdate(@Req() request: Request, @Param() param: CartItemUpdateParamDto, @Body() body: CartItemUpdateDto) {
    const params = { ...param, ...body };
    return await this.cartItemUpdateService.startCartItemUpdate(request, params);
  }

  @EventPattern('rmq_clear_cart')
  async rmqClearCart(@Payload() body) {
    const params = body;
    const request = {};
                
    return await this.rmqClearCartService.startRmqClearCart(request, params);
  }

  @MessagePattern('rmq_get_address_list')
  async rmqGetAddressList(@Payload() body) {
    const params = body;
    const request = {};
                
    return await this.rmqGetAddressListService.startRmqGetAddressList(request, params);
  }

  @MessagePattern('rmq_cart_items_details')
  async rmqGetCartItemsDetails(@Payload() body) {
    const params = body;
    const request = {};
                
    return await this.rmqGetCartItemsDetailsService.startRmqGetCartItemsDetails(request, params);
  }

  @MessagePattern('rmq_cart_details')
  async rmqGetCartDetails(@Payload() body) {
    const params = body;
    const request = {};
                
    return await this.rmqGetCartDetailsService.startRmqGetCartDetails(request, params);
  }

  @MessagePattern('rmq_get_user_address')
  async rmqGetUserAddress(@Payload() body) {
    const params = body;
    const request = {};
                
    return await this.rmqGetUserAddressService.startRmqGetUserAddress(request, params);
  }

  @MessagePattern('rmq_user_details')
  async rmqGetUserDetails(@Payload() body) {
    const params = body;
    const request = {};
                
    return await this.rmqGetUserDetailsService.startRmqGetUserDetails(request, params);
  }

  @Post('user-add')
  async userAdd(@Req() request: Request, @Body() body: UserAddDto) {
    const params = body;
    return await this.userAddService.startUserAdd(request, params);
  }

  @Post('user-address-add')
  async userAddressAdd(@Req() request: Request, @Body() body: UserAddressAddDto) {
    const params = body;
    return await this.userAddressAddService.startUserAddressAdd(request, params);
  }

  @Post('user-address-change-status')
  async userAddressChangeStatus(@Req() request: Request, @Body() body: UserAddressChangeStatusDto) {
    const params = body;
    return await this.userAddressChangeStatusService.startUserAddressChangeStatus(request, params);
  }

  @Delete('user-address-delete/:id')
  async userAddressDelete(@Req() request: Request, @Param() param: UserAddressDeleteParamDto, @Body() body: UserAddressDeleteDto) {
    const params = { ...param, ...body };
    return await this.userAddressDeleteService.startUserAddressDelete(request, params);
  }

  @Get('user-address-details/:id')
  async userAddressDetails(@Req() request: Request, @Param() param: UserAddressDetailsParamDto, @Query() query: UserAddressDetailsDto) {
    const params = { ...param, ...query };
    return await this.userAddressDetailsService.startUserAddressDetails(request, params);
  }

  @Post('user-address-list')
  async userAddressList(@Req() request: Request, @Body() body: UserAddressListDto) {
    const params = body;
    return await this.userAddressListService.startUserAddressList(request, params);
  }

  @Put('user-address-update/:id')
  async userAddressUpdate(@Req() request: Request, @Param() param: UserAddressUpdateParamDto, @Body() body: UserAddressUpdateDto) {
    const params = { ...param, ...body };
    return await this.userAddressUpdateService.startUserAddressUpdate(request, params);
  }

  @Get('user-autocomplete')
  async userAutocomplete(@Req() request: Request, @Query() query: UserAutocompleteDto) {
    const params = { ...query };
    return await this.userAutocompleteService.startUserAutocomplete(request, params);
  }

  @Post('user-change-password')
  async userChangePassword(@Req() request: Request, @Body() body: UserChangePasswordDto) {
    const params = body;
    return await this.userChangePasswordService.startUserChangePassword(request, params);
  }

  @Post('user-change-status')
  async userChangeStatus(@Req() request: Request, @Body() body: UserChangeStatusDto) {
    const params = body;
    return await this.userChangeStatusService.startUserChangeStatus(request, params);
  }

  @Post('user-contact-us')
  async userContactUs(@Req() request: Request, @Body() body: UserContactUsDto) {
    const params = body;
    return await this.userContactUsService.startUserContactUs(request, params);
  }

  @Get('user-details/:id')
  async userDetails(@Req() request: Request, @Param() param: UserDetailsParamDto, @Query() query: UserDetailsDto) {
    const params = { ...param, ...query };
    return await this.userDetailsService.startUserDetails(request, params);
  }

  @Post('user-forgot-password')
  async userForgotPassword(@Req() request: Request, @Body() body: UserForgotPasswordDto) {
    const params = body;
    return await this.userForgotPasswordService.startUserForgotPassword(request, params);
  }

  @Post('user-list')
  async userList(@Req() request: Request, @Body() body: UserListDto) {
    const params = body;
    return await this.userListService.startUserList(request, params);
  }

  @Post('user-login')
  async userLogin(@Req() request: Request, @Body() body: UserLoginDto) {
    const params = body;
    return await this.userLoginService.startUserLogin(request, params);
  }

  @Post('user-rest-password')
  async userRestPassword(@Req() request: Request, @Body() body: UserRestPasswordDto) {
    const params = body;
    return await this.userRestPasswordService.startUserRestPassword(request, params);
  }

  @Put('user-update/:id')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'profile_image' },
  ]))
  async userUpdate(@Req() request: Request, @Param() param: UserUpdateParamDto, @Body() body: UserUpdateDto, @UploadedFiles() files: Record<string, Express.Multer.File[]>) {
    const params = { ...param, ...body };

    const fileDto = new UserUpdateFileDto();
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

    return await this.userUpdateService.startUserUpdate(request, params);
  }

}
