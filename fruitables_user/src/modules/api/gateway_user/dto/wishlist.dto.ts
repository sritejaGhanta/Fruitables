import { IsInt, IsNotEmpty } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class WishlistDto {
  @IsInt()
  @IsNotEmpty({
    message: () => custom.lang('Please enter value for product_id field'),
  })
  product_id: number;
}
