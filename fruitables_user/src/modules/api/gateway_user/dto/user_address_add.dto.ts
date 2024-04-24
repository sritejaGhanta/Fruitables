import { IsString, IsNotEmpty, IsIn, IsOptional } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class UserAddressAddDto {

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter value for land_mark field') })
  land_mark: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter value for address field') })
  address: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter value for state_name field') })
  state_name: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter value for countr_name field') })
  countr_name: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter value for pin_code field') })
  pin_code: string;

  @IsString()
  @IsIn(['Active', 'active', 'Inactive', 'inactive'])
  @IsOptional()
  status: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the first_name field.') })
  first_name: string;

  @IsString()
  @IsOptional()
  last_name: string;

  @IsString()
  @IsOptional()
  company_name: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the email field.') })
  email: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the phone_number field.') })
  phone_number: string;

}

