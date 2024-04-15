import { IsString, IsNotEmpty, IsInt, IsIn } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class StateAddDto {

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the state_name field.') })
  state_name: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the state_code field.') })
  state_code: string;

  @IsInt()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the country_id field.') })
  country_id: number;

  @IsString()
  @IsIn(['active', 'inactive', 'Active', 'Inactive'])
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the status field.') })
  status: string;

}

