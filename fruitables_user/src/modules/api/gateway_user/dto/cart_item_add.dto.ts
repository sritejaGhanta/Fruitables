import { IsInt, IsNotEmpty } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class CartItemAddDto {

  @IsInt()
  @IsNotEmpty({ message: () => custom.lang('Please enter value for product_id field') })
  product_id: number;

  @IsInt()
  @IsNotEmpty({ message: () => custom.lang('Please enter value for product_qty field') })
  product_qty: number;

}

