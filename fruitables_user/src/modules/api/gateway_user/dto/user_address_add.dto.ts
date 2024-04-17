import { IsString, IsNotEmpty, IsIn } from 'class-validator';
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
  @IsNotEmpty({ message: () => custom.lang('Please enter value for status field') })
  status: string;

}

