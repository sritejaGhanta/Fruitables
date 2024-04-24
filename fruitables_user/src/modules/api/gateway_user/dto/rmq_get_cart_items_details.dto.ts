import { IsInt, IsNotEmpty } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class RmqGetCartItemsDetailsDto {

  @IsInt()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the cart_id field.') })
  cart_id: number;

}

