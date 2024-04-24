import { IsInt, IsNotEmpty } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class CartItemDeleteDto {

  @IsInt()
  @IsNotEmpty({ message: () => custom.lang('Please enter value for id field') })
  cart_item_id: number;

  @IsInt()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the product_id field.') })
  product_id: number;

}

