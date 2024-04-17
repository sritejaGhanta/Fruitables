import { IsString, IsNotEmpty, IsInt } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class CartItemUpdateDto {

  @IsInt()
  @IsNotEmpty({ message: () => custom.lang('Please enter value for cart_id field') })
  cart_id: number;

  @IsInt()
  @IsNotEmpty({ message: () => custom.lang('Please enter value for product_id field') })
  product_id: number;

  @IsInt()
  @IsNotEmpty({ message: () => custom.lang('Please enter value for product_qty field') })
  product_qty: number;

}



export class CartItemUpdateParamDto {

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter value for id field') })
  id: string;

}
