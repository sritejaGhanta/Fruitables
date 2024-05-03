import { IsString, IsNotEmpty } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class AddSubscriberDto {

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the email field.') })
  email: string;

}

