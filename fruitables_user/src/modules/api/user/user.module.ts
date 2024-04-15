import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GlobalModule } from 'src/modules/global/global.module';
import { UserController } from './user.controller';

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

import { AdminEntity } from 'src/entities/admin.entity';
import { CustomerEntity } from 'src/entities/customer.entity';
import { CapabilityCategoryEntity } from 'src/entities/capability-category.entity';
import { CapabilityMasterEntity } from 'src/entities/capability-master.entity';
import { GroupMasterEntity } from 'src/entities/group-master.entity';

@Module({
  imports: [
    GlobalModule,
    TypeOrmModule.forFeature([
      AdminEntity,
      CustomerEntity,
      CapabilityCategoryEntity,
      CapabilityMasterEntity,
      GroupMasterEntity,
    ])
  ],
  controllers: [UserController],
  providers: [
    AdminAddExtendedService,
    AdminChangeStatusExtendedService,
    AdminDeleteExtendedService,
    AdminDetailsExtendedService,
    AdminIdentityExtendedService,
    AdminListExtendedService,
    AdminProfileUpdateService,
    AdminUpdateExtendedService,
    CheckAdminEmailService,
    CheckCustomerEmailService,
    CustomerAddExtendedService,
    CustomerChangeStatusService,
    CustomerDeleteService,
    CustomerDetailsService,
    CustomerListExtendedService,
    CustomerUpdateService,
    GetCustomerDetailsService,
    GroupCapabilityListService,
    GroupCapabilityUpdateExtendedService,
    UpdateCustomerDetailsService,
    UpdateCustomerProfileImageService,
  ]
})
export default class UserModule {}
