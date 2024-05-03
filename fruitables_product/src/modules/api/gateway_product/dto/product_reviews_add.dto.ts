import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class ProductReviewsAddDto {

  @IsInt()
  @IsNotEmpty({ message: () => custom.lang('Please enter value for product_id field') })
  product_id: number;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter value for review field') })
  review: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter value for rating field') })
  rating: string;

  @IsInt()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the user_id field.') })
  user_id: number;

}

