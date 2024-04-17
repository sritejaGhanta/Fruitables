import { IsString, IsNotEmpty } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class UserDetailsDto {

}



export class UserDetailsParamDto {

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter value for id field') })
  id: string;

}
