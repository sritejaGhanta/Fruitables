import { IsString, IsNotEmpty } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class AdminDetailsDto {

}



export class AdminDetailsParamDto {

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the id field.') })
  id: string;

}
