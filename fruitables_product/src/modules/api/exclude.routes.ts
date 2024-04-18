import { Routes } from 'nest-router';
import { RequestMethod } from '@nestjs/common/enums/request-method.enum';

export const excludeRoutes = [
  { path: 'api/rest/upload-file', method: RequestMethod.POST },
  { path: 'api/rest/create-token', method: RequestMethod.GET },
  { path: 'api/rest/image-resize', method: RequestMethod.GET },
  { path: 'api/auth/admin-forgot-password', method: RequestMethod.POST },
  { path: 'api/auth/admin-login', method: RequestMethod.POST },
  { path: 'api/auth/admin-reset-password', method: RequestMethod.POST },
  { path: 'api/auth/token-verification', method: RequestMethod.POST },
  { path: 'api/auth/customer-forgot-password', method: RequestMethod.POST },
  { path: 'api/auth/customer-login', method: RequestMethod.POST },
  { path: 'api/auth/customer-registration', method: RequestMethod.POST },
  { path: 'api/auth/customer-reset-password', method: RequestMethod.POST },
  { path: 'api/gateway_product/dashboard-products', method: RequestMethod.POST },
  { path: 'api/gateway_product/faq-add', method: RequestMethod.POST },
  { path: 'api/gateway_product/faq-list', method: RequestMethod.POST },
  { path: 'api/gateway_product/faq-update', method: RequestMethod.PUT },
  { path: 'api/tools/general-settings', method: RequestMethod.GET },
  { path: 'api/tools/dial-codes', method: RequestMethod.GET },
  { path: 'api/tools/countries', method: RequestMethod.GET },
  { path: 'api/tools/country-states', method: RequestMethod.GET },
  { path: 'api/gateway_product/product-category-list', method: RequestMethod.POST },
  { path: 'api/gateway_product/products-details', method: RequestMethod.GET },
  { path: 'api/gateway_product/products-list', method: RequestMethod.POST },
  { path: 'api/gateway_product/rmq-get-product-details', method: RequestMethod.POST },
  { path: 'api/tools/settings', method: RequestMethod.GET },
  { path: 'api/tools/settings-upload-files', method: RequestMethod.POST },
  { path: 'api/auth/validate', method: RequestMethod.POST },
  { path: 'api/auth/verify-admin-email', method: RequestMethod.POST },
  { path: 'api/auth/verify-customer-email', method: RequestMethod.POST }
];