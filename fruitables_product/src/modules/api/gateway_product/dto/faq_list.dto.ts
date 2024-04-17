import { IsString, IsOptional, IsInt, IsNotEmpty } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class FaqListDto {

  @IsString()
  @IsOptional()
  keyword: string;

  @IsInt()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the product_id field.') })
  product_id: number;

}

