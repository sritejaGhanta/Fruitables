import { IsString, IsNotEmpty, IsEmail } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class CustomerRegistrationDto {

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the first_name field.') })
  first_name: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the last_name field.') })
  last_name: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the email field.') })
  @IsEmail({}, { message: () => custom.lang('Please enter valid email address for the email field.') })
  email: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the password field.') })
  password: string;

}

