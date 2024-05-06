import { Routes } from 'nest-router';
import { RequestMethod } from '@nestjs/common/enums/request-method.enum';

export const excludeRoutes = [
  { path: 'api/rest/upload-file', method: RequestMethod.POST },
  { path: 'api/rest/create-token', method: RequestMethod.GET },
  { path: 'api/rest/image-resize', method: RequestMethod.GET },
  { path: 'api/gateway_user/add-subscriber', method: RequestMethod.POST },
  { path: 'api/auth/admin-forgot-password', method: RequestMethod.POST },
  { path: 'api/auth/admin-login', method: RequestMethod.POST },
  { path: 'api/auth/admin-reset-password', method: RequestMethod.POST },
  { path: 'api/auth/token-verification', method: RequestMethod.POST },
  { path: 'api/auth/customer-forgot-password', method: RequestMethod.POST },
  { path: 'api/auth/customer-login', method: RequestMethod.POST },
  { path: 'api/auth/customer-registration', method: RequestMethod.POST },
  { path: 'api/auth/customer-reset-password', method: RequestMethod.POST },
  { path: 'api/tools/general-settings', method: RequestMethod.GET },
  { path: 'api/tools/dial-codes', method: RequestMethod.GET },
  { path: 'api/tools/countries', method: RequestMethod.GET },
  { path: 'api/tools/country-states', method: RequestMethod.GET },
  {
    path: 'api/gateway_user/get-user-subscribe-dtails',
    method: RequestMethod.GET,
  },
  { path: 'api/gateway_user/rmq-clear-cart', method: RequestMethod.POST },
  { path: 'api/gateway_user/rmq-get-address-list', method: RequestMethod.POST },
  {
    path: 'api/gateway_user/rmq-get-cart-items-details',
    method: RequestMethod.POST,
  },
  { path: 'api/gateway_user/rmq-get-cart-details', method: RequestMethod.GET },
  { path: 'api/gateway_user/rmq-get-user-address', method: RequestMethod.POST },
  { path: 'api/gateway_user/rmq-get-user-details', method: RequestMethod.POST },
  { path: 'api/gateway_user/rmq-get-users-list', method: RequestMethod.GET },
  { path: 'api/gateway_user/rmq-user-otp-update', method: RequestMethod.GET },
  { path: 'api/tools/settings', method: RequestMethod.GET },
  { path: 'api/tools/settings-upload-files', method: RequestMethod.POST },
  { path: 'api/gateway_user/user-add', method: RequestMethod.POST },
  { path: 'api/gateway_user/user-autocomplete', method: RequestMethod.GET },
  { path: 'api/gateway_user/user-change-status', method: RequestMethod.POST },
  { path: 'api/gateway_user/user-contact-us', method: RequestMethod.POST },
  { path: 'api/gateway_user/user-details', method: RequestMethod.GET },
  { path: 'api/gateway_user/user-forgot-password', method: RequestMethod.POST },
  { path: 'api/gateway_user/user-list', method: RequestMethod.POST },
  { path: 'api/gateway_user/user-login', method: RequestMethod.POST },
  { path: 'api/gateway_user/user-reset-password', method: RequestMethod.POST },
  { path: 'api/gateway_user/user-update', method: RequestMethod.PUT },
  { path: 'api/auth/validate', method: RequestMethod.POST },
  { path: 'api/auth/verify-admin-email', method: RequestMethod.POST },
  { path: 'api/auth/verify-customer-email', method: RequestMethod.POST },
];
