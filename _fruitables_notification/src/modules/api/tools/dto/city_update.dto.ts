import { IsString, IsNotEmpty, IsInt, IsIn } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class CityUpdateDto {

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the city_name field.') })
  city_name: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the city_code field.') })
  city_code: string;

  @IsInt()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the country_id field.') })
  country_id: number;

  @IsInt()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the state_id field.') })
  state_id: number;

  @IsString()
  @IsIn(['active', 'inactive', 'Active', 'Inactive'])
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the status field.') })
  status: string;

}



export class CityUpdateParamDto {

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the id field.') })
  id: string;

}
