import { IsNumber, IsNotEmpty } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class RmqGetUserDetailsDto {

  @IsNumber()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the id field.') })
  id: number;

}

