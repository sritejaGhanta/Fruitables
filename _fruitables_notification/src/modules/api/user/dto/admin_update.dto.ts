import { IsInt, IsNotEmpty, IsString, IsEmail, MinLength, MaxLength, IsIn } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class AdminUpdateDto {

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the name field.') })
  name: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the email field.') })
  @IsEmail({}, { message: () => custom.lang('Please enter valid email address for the email field.') })
  email: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the username field.') })
  username: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the dial_code field.') })
  dial_code: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the phone_number field.') })
  @MinLength(6, { message: () => custom.lang('Please enter range length for the phone_number field.') })
  @MaxLength(14, { message: () => custom.lang('Please enter range length for the phone_number field.') })
  phone_number: string;

  @IsInt()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the group_id field.') })
  group_id: number;

  @IsString()
  @IsIn(['active', 'inactive', 'Active', 'Inactive'])
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the status field.') })
  status: string;

}



export class AdminUpdateParamDto {

  @IsInt()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the id field.') })
  id: number;

}
