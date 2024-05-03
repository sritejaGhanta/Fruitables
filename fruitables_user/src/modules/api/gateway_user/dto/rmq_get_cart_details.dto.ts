import { IsString, IsNotEmpty } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class RmqGetCartDetailsDto {

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the user_id field.') })
  user_id: string;

}

