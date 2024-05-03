import { IsString, IsNotEmpty } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class AdminResetPasswordDto {

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the otp_code field.') })
  otp_code: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the password field.') })
  password: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the token field.') })
  token: string;

}

