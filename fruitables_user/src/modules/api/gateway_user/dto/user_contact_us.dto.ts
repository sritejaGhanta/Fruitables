import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class UserContactUsDto {

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the name field.') })
  name: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the email field.') })
  email: string;

  @IsString()
  @IsOptional()
  message: string;

}

