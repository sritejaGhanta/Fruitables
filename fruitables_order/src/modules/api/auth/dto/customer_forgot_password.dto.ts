import { IsString, IsNotEmpty, IsEmail } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class CustomerForgotPasswordDto {

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the email field.') })
  @IsEmail({}, { message: () => custom.lang('Please enter valid email address for the email field.') })
  email: string;

}

