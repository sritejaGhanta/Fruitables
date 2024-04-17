import { IsArray, IsNotEmpty, IsString, IsIn } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class UserChangeStatusDto {

  @IsArray()
  @IsNotEmpty({ message: () => custom.lang('Please enter value for ids field') })
  ids: any[];

  @IsString()
  @IsIn(['Active', 'active', 'Inactive', 'inactive'])
  @IsNotEmpty({ message: () => custom.lang('Please enter value for status field') })
  status: string;

}

