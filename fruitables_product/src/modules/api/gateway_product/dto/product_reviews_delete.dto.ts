import { IsString, IsNotEmpty, IsInt } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class ProductReviewsDeleteDto {

  @IsInt()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the user_id field.') })
  user_id: number;

}



export class ProductReviewsDeleteParamDto {

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter value for id field') })
  id: string;

}
