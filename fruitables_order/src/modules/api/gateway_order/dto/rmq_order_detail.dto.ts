import { IsString, IsNotEmpty } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class RmqOrderDetailDto {

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the order_id field.') })
  order_id: string;

}

