import { IsString, IsNotEmpty } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class CustomerResetPasswordDto {

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the customer_id field.') })
  customer_id: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the otp_code field.') })
  otp_code: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the password field.') })
  password: string;

}

