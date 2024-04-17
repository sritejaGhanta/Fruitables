import { IsString, IsNotEmpty } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class ProductCategoryDeleteDto {

}



export class ProductCategoryDeleteParamDto {

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter value for id field') })
  id: string;

}
