import { IsString, IsNotEmpty, IsInt } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class ProductReviewsUpdateDto {

  @IsInt()
  @IsNotEmpty({ message: () => custom.lang('Please enter value for product_id field') })
  product_id: number;

  @IsInt()
  @IsNotEmpty({ message: () => custom.lang('Please enter value for user_id field') })
  user_id: number;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter value for review field') })
  review: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter value for rating field') })
  rating: string;

}



export class ProductReviewsUpdateParamDto {

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter value for id field') })
  id: string;

}
