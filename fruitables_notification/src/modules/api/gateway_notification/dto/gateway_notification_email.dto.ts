import { IsString, IsNotEmpty, IsIn } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class GatewayNotificationEmailDto {
  @IsString()
  @IsNotEmpty({
    message: () => custom.lang('Please enter a value for the id field.'),
  })
  id: string;

  @IsString()
  @IsIn(['order,user'])
  @IsNotEmpty({
    message: () => custom.lang('Please enter a value for the id_type field.'),
  })
  id_type: string;

  @IsString()
  @IsIn([
    'ORDER_ADD, ORDER_STATUS_UPDATE, USER_ADD, FORGOT_PASSWORD, USER_CHANGE_PASSWORD',
  ])
  @IsNotEmpty({
    message: () =>
      custom.lang('Please enter a value for the notification_type field.'),
  })
  notification_type: string;

  @IsString()
  @IsNotEmpty({
    message: () => custom.lang('Please enter a value for the otp field.'),
  })
  otp: string;
}
