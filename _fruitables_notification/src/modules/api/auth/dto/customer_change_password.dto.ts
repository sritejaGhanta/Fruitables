import { IsString, IsNotEmpty } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class CustomerChangePasswordDto {

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the old_password field.') })
  old_password: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the new_password field.') })
  new_password: string;

}

