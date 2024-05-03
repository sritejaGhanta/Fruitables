import { IsString, IsNotEmpty } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class CartItemDeleteDto {

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the product_id field.') })
  product_id: string;

}



export class CartItemDeleteParamDto {

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the cart_item_id field.') })
  cart_item_id: string;

}
