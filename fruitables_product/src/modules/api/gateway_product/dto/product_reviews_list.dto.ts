import { IsInt, IsNotEmpty } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class ProductReviewsListDto {

  @IsInt()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the product_id field.') })
  product_id: number;

}

