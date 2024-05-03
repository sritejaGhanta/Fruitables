import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GlobalModule } from 'src/modules/global/global.module';
import { AuthController } from './auth.controller';

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

import { AdminEntity } from 'src/entities/admin.entity';
import { AdminPasswordsEntity } from 'src/entities/admin-passwords.entity';
import { LogHistoryEntity } from 'src/entities/log-history.entity';
import { CapabilityMasterEntity } from 'src/entities/capability-master.entity';
import { CustomerEntity } from 'src/entities/customer.entity';
import { AdminMenuEntity } from 'src/entities/admin-menu.entity';

@Module({
  imports: [
    GlobalModule,
    TypeOrmModule.forFeature([
      AdminEntity,
      AdminPasswordsEntity,
      LogHistoryEntity,
      CapabilityMasterEntity,
      CustomerEntity,
      AdminMenuEntity,
    ])
  ],
  controllers: [AuthController],
  providers: [
    AdminChangePasswordService,
    AdminForgotPasswordExtendedService,
    AdminLoginService,
    AdminLogoutService,
    AdminResetPasswordExtendedService,
    AdminTokenVerificationExtendedService,
    CapabilitiesExtendedService,
    CustomerChangePasswordService,
    CustomerForgotPasswordExtendedService,
    CustomerLoginExtendedService,
    CustomerLogoutService,
    CustomerRegistrationExtendedService,
    CustomerResetPasswordExtendedService,
    MenuExtendedService,
    ResendAdminVerifyEmailExtendedService,
    ResendCustomerVerifyEmailExtendedService,
    ValidateAdminService,
    VerifyAdminEmailExtendedService,
    VerifyCustomerEmailExtendedService,
  ]
})
export default class AuthModule {}
