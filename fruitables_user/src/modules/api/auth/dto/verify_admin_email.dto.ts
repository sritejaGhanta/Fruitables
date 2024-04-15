import { IsString, IsNotEmpty } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class VerifyAdminEmailDto {

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the verify_token field.') })
  verify_token: string;

}

