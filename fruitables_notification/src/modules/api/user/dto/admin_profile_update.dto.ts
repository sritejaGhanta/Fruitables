import { IsString, IsNotEmpty } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class AdminProfileUpdateDto {

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the name field.') })
  name: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the email field.') })
  email: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the dial_code field.') })
  dial_code: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the phone_number field.') })
  phone_number: string;

}

