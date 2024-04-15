import { IsString, IsNotEmpty } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class AdminTokenVerificationDto {

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the token field.') })
  token: string;

}

