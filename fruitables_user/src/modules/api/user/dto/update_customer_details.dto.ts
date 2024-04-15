import { IsString, IsNotEmpty } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class UpdateCustomerDetailsDto {

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the first_name field.') })
  first_name: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the last_name field.') })
  last_name: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the dial_code field.') })
  dial_code: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the phone_number field.') })
  phone_number: string;

}

