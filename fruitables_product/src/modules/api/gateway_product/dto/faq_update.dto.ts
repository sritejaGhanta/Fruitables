import { IsString, IsNotEmpty, IsInt } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class FaqUpdateDto {

  @IsInt()
  @IsNotEmpty({ message: () => custom.lang('Please enter value for product_id field') })
  product_id: number;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter value for question_name field') })
  question_name: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter value for answer field') })
  answer: string;

}



export class FaqUpdateParamDto {

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter value for id field') })
  id: string;

}
