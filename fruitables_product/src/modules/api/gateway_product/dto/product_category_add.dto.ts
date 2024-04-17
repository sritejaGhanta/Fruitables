import { IsString, IsNotEmpty, IsIn } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class ProductCategoryAddDto {

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter value for category_name field') })
  category_name: string;

  @IsString()
  @IsIn(['Active', 'active', 'Inactive', 'inactive'])
  @IsNotEmpty({ message: () => custom.lang('Please enter value for status field') })
  status: string;

}

