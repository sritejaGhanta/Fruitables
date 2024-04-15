import { IsArray, IsNotEmpty, IsString, IsIn } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class CityChangeStatusDto {

  @IsArray()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the ids field.') })
  ids: any[];

  @IsString()
  @IsIn(['active', 'inactive', 'Active', 'Inactive'])
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the status field.') })
  status: string;

}

