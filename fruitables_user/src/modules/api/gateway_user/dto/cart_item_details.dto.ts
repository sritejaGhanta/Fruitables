import { IsString, IsNotEmpty } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class CartItemDetailsDto {

}



export class CartItemDetailsParamDto {

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter value for id field') })
  id: string;

}
