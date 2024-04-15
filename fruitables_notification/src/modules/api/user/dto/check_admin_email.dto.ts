import { IsString, IsNotEmpty, IsInt, IsOptional } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class CheckAdminEmailDto {

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the email field.') })
  email: string;

  @IsInt()
  @IsOptional()
  id: number;

}

