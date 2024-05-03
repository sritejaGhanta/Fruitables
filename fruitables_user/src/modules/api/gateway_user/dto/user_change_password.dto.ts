import { IsString, IsNotEmpty } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class UserChangePasswordDto {
  @IsString()
  @IsNotEmpty({
    message: () => custom.lang('Please enter a value for the password field.'),
  })
  password: string;

  @IsString()
  @IsNotEmpty({
    message: () =>
      custom.lang('Please enter a value for the new_passowrd field.'),
  })
  new_password: string;
}
