import { IsNumber, IsNotEmpty, IsString } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class UserRestPasswordDto {

  @IsNumber()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the otp field.') })
  otp: number;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the email field.') })
  email: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the password field.') })
  password: string;

}

