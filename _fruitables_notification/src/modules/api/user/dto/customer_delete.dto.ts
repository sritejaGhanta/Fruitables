import { IsString, IsNotEmpty } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class CustomerDeleteDto {

}



export class CustomerDeleteParamDto {

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the id field.') })
  id: string;

}
