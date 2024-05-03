import { IsString, IsNotEmpty, IsInt } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class OrderDetailsDto {

  @IsInt()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the user_id field.') })
  user_id: number;

}



export class OrderDetailsParamDto {

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the id field.') })
  id: string;

}
