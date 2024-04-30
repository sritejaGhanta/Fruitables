import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GlobalModule } from 'src/modules/global/global.module';
import { GatewayUserController } from './gateway_user.controller';

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
import { WishlistService } from './services/wishlist.service';
import { WishlistDetailsService } from './services/wishlist_details.service';
import { WishlistListExtendedService } from './services/extended/wishlist_list.extended.service';

import { CartItemEntity } from 'src/entities/cart-item.entity';
import { CartEntity } from 'src/entities/cart.entity';
import { UserAddressEntity } from 'src/entities/user-address.entity';
import { UserEntity } from 'src/entities/user.entity';
import { ContactUsEntity } from 'src/entities/contact-us.entity';
import { WishlistEntity } from 'src/entities/wishlist.entity';

@Module({
  imports: [
    GlobalModule,
    TypeOrmModule.forFeature([
      CartItemEntity,
      CartEntity,
      UserAddressEntity,
      UserEntity,
      ContactUsEntity,
      WishlistEntity,
    ]),
  ],
  controllers: [GatewayUserController],
  providers: [
    CartItemAddExtendedService,
    CartItemDeleteService,
    CartItemListExtendedService,
    CartItemUpdateService,
    RmqClearCartService,
    RmqGetAddressListService,
    RmqGetCartItemsDetailsExtendedService,
    RmqGetCartDetailsService,
    RmqGetUserAddressService,
    RmqGetUserDetailsService,
    UserAddService,
    UserAddressAddService,
    UserAddressChangeStatusService,
    UserAddressDeleteService,
    UserAddressDetailsService,
    UserAddressListExtendedService,
    UserAddressUpdateService,
    UserAutocompleteService,
    UserChangePasswordService,
    UserChangeStatusService,
    UserContactUsService,
    UserDetailsService,
    UserForgotPasswordExtendedService,
    UserListExtendedService,
    UserLoginService,
    UserRestPasswordService,
    UserUpdateExtendedService,
    WishlistService,
    WishlistDetailsService,
    WishlistListExtendedService,
  ],
})
export default class GatewayUserModule {}
