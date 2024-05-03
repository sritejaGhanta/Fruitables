import { IsInt, IsNotEmpty } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class OrderAddDto {

  @IsInt()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the user_id field.') })
  user_id: number;

  @IsInt()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the address_id field.') })
  address_id: number;

}

