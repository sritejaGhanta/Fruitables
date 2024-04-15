import { Controller, UseFilters, Post, Req, Request, Body, Get, Query } from '@nestjs/common';

import { HttpExceptionFilter } from 'src/filters/http-exception.filter';
import { CitGeneralLibrary } from 'src/utilities/cit-general-library';
import { AdminChangePasswordService } from './services/admin_change_password.service';
import { AdminForgotPasswordExtendedService } from './services/extended/admin_forgot_password.extended.service';
import { AdminLoginService } from './services/admin_login.service';
import { AdminLogoutService } from './services/admin_logout.service';
import { AdminResetPasswordExtendedService } from './services/extended/admin_reset_password.extended.service';
import { AdminTokenVerificationExtendedService } from './services/extended/admin_token_verification.extended.service';
import { CapabilitiesExtendedService } from './services/extended/capabilities.extended.service';
import { CustomerChangePasswordService } from './services/customer_change_password.service';
import { CustomerForgotPasswordExtendedService } from './services/extended/customer_forgot_password.extended.service';
import { CustomerLoginExtendedService } from './services/extended/customer_login.extended.service';
import { CustomerLogoutService } from './services/customer_logout.service';
import { CustomerRegistrationExtendedService } from './services/extended/customer_registration.extended.service';
import { CustomerResetPasswordExtendedService } from './services/extended/customer_reset_password.extended.service';
import { MenuExtendedService } from './services/extended/menu.extended.service';
import { ResendAdminVerifyEmailExtendedService } from './services/extended/resend_admin_verify_email.extended.service';
import { ResendCustomerVerifyEmailExtendedService } from './services/extended/resend_customer_verify_email.extended.service';
import { ValidateAdminService } from './services/validate_admin.service';
import { VerifyAdminEmailExtendedService } from './services/extended/verify_admin_email.extended.service';
import { VerifyCustomerEmailExtendedService } from './services/extended/verify_customer_email.extended.service';
import { AdminChangePasswordDto } from './dto/admin_change_password.dto';
import { AdminForgotPasswordDto } from './dto/admin_forgot_password.dto';
import { AdminLoginDto } from './dto/admin_login.dto';
import { AdminResetPasswordDto } from './dto/admin_reset_password.dto';
import { AdminTokenVerificationDto } from './dto/admin_token_verification.dto';
import { CustomerChangePasswordDto } from './dto/customer_change_password.dto';
import { CustomerForgotPasswordDto } from './dto/customer_forgot_password.dto';
import { CustomerLoginDto } from './dto/customer_login.dto';
import { CustomerRegistrationDto } from './dto/customer_registration.dto';
import { CustomerResetPasswordDto } from './dto/customer_reset_password.dto';
import { ValidateAdminDto } from './dto/validate_admin.dto';
import { VerifyAdminEmailDto } from './dto/verify_admin_email.dto';
import { VerifyCustomerEmailDto } from './dto/verify_customer_email.dto';

@Controller()
@UseFilters(HttpExceptionFilter)
export class AuthController {
  constructor(
    protected readonly general: CitGeneralLibrary,
    private adminChangePasswordService: AdminChangePasswordService,
    private adminForgotPasswordService: AdminForgotPasswordExtendedService,
    private adminLoginService: AdminLoginService,
    private adminLogoutService: AdminLogoutService,
    private adminResetPasswordService: AdminResetPasswordExtendedService,
    private adminTokenVerificationService: AdminTokenVerificationExtendedService,
    private capabilitiesService: CapabilitiesExtendedService,
    private customerChangePasswordService: CustomerChangePasswordService,
    private customerForgotPasswordService: CustomerForgotPasswordExtendedService,
    private customerLoginService: CustomerLoginExtendedService,
    private customerLogoutService: CustomerLogoutService,
    private customerRegistrationService: CustomerRegistrationExtendedService,
    private customerResetPasswordService: CustomerResetPasswordExtendedService,
    private menuService: MenuExtendedService,
    private resendAdminVerifyEmailService: ResendAdminVerifyEmailExtendedService,
    private resendCustomerVerifyEmailService: ResendCustomerVerifyEmailExtendedService,
    private validateAdminService: ValidateAdminService,
    private verifyAdminEmailService: VerifyAdminEmailExtendedService,
    private verifyCustomerEmailService: VerifyCustomerEmailExtendedService,
  ) {}

  @Post('admin-change-password')
  async adminChangePassword(@Req() request: Request, @Body() body: AdminChangePasswordDto) {
    const params = body;
    return await this.adminChangePasswordService.startAdminChangePassword(request, params);
  }

  @Post('admin-forgot-password')
  async adminForgotPassword(@Req() request: Request, @Body() body: AdminForgotPasswordDto) {
    const params = body;
    return await this.adminForgotPasswordService.startAdminForgotPassword(request, params);
  }

  @Post('admin-login')
  async adminLogin(@Req() request: Request, @Body() body: AdminLoginDto) {
    const params = body;
    return await this.adminLoginService.startAdminLogin(request, params);
  }

  @Post('admin-logout')
  async adminLogout(@Req() request: Request, @Body() body) {
    const params = body;
    return await this.adminLogoutService.startAdminLogout(request, params);
  }

  @Post('admin-reset-password')
  async adminResetPassword(@Req() request: Request, @Body() body: AdminResetPasswordDto) {
    const params = body;
    return await this.adminResetPasswordService.startAdminResetPassword(request, params);
  }

  @Post('token-verification')
  async adminTokenVerification(@Req() request: Request, @Body() body: AdminTokenVerificationDto) {
    const params = body;
    return await this.adminTokenVerificationService.startAdminTokenVerification(request, params);
  }

  @Get('capabilities')
  async capabilities(@Req() request: Request, @Query() query) {
    const params = { ...query };
    return await this.capabilitiesService.startCapabilities(request, params);
  }

  @Post('customer-change-password')
  async customerChangePassword(@Req() request: Request, @Body() body: CustomerChangePasswordDto) {
    const params = body;
    return await this.customerChangePasswordService.startCustomerChangePassword(request, params);
  }

  @Post('customer-forgot-password')
  async customerForgotPassword(@Req() request: Request, @Body() body: CustomerForgotPasswordDto) {
    const params = body;
    return await this.customerForgotPasswordService.startCustomerForgotPassword(request, params);
  }

  @Post('customer-login')
  async customerLogin(@Req() request: Request, @Body() body: CustomerLoginDto) {
    const params = body;
    return await this.customerLoginService.startCustomerLogin(request, params);
  }

  @Post('customer-logout')
  async customerLogout(@Req() request: Request, @Body() body) {
    const params = body;
    return await this.customerLogoutService.startCustomerLogout(request, params);
  }

  @Post('customer-registration')
  async customerRegistration(@Req() request: Request, @Body() body: CustomerRegistrationDto) {
    const params = body;
    return await this.customerRegistrationService.startCustomerRegistration(request, params);
  }

  @Post('customer-reset-password')
  async customerResetPassword(@Req() request: Request, @Body() body: CustomerResetPasswordDto) {
    const params = body;
    return await this.customerResetPasswordService.startCustomerResetPassword(request, params);
  }

  @Get('menu')
  async menu(@Req() request: Request, @Query() query) {
    const params = { ...query };
    return await this.menuService.startMenu(request, params);
  }

  @Post('resend-admin-verify-email')
  async resendAdminVerifyEmail(@Req() request: Request, @Body() body) {
    const params = body;
    return await this.resendAdminVerifyEmailService.startResendAdminVerifyEmail(request, params);
  }

  @Post('resend-customer-verify-email')
  async resendCustomerVerifyEmail(@Req() request: Request, @Body() body) {
    const params = body;
    return await this.resendCustomerVerifyEmailService.startResendCustomerVerifyEmail(request, params);
  }

  @Post('validate')
  async validateAdmin(@Req() request: Request, @Body() body: ValidateAdminDto) {
    const params = body;
    return await this.validateAdminService.startValidateAdmin(request, params);
  }

  @Post('verify-admin-email')
  async verifyAdminEmail(@Req() request: Request, @Body() body: VerifyAdminEmailDto) {
    const params = body;
    return await this.verifyAdminEmailService.startVerifyAdminEmail(request, params);
  }

  @Post('verify-customer-email')
  async verifyCustomerEmail(@Req() request: Request, @Body() body: VerifyCustomerEmailDto) {
    const params = body;
    return await this.verifyCustomerEmailService.startVerifyCustomerEmail(request, params);
  }

}
