import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class CartItemUpdateDto {

  @IsNumber()
  @IsNotEmpty({ message: () => custom.lang('Please enter value for product_qty field') })
  change_quantity: number;

}



export class CartItemUpdateParamDto {

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter value for id field') })
  id: string;

}
