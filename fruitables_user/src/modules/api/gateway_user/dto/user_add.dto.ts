import { IsString, IsNotEmpty } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class UserAddDto {

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter value for first_name field') })
  first_name: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter value for last_name field') })
  last_name: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter value for email field') })
  email: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter value for password field') })
  password: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter value for phone_number field') })
  phone_number: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the dial_code field.') })
  dial_code: string;

}

