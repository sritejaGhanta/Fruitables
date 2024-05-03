import { IsInt, IsOptional } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class CartItemListDto {

  @IsInt()
  @IsOptional()
  cart_id: number;

}

