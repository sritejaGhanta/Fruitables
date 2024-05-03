import { IsString, IsNotEmpty } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class SettingsDto {

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the type field.') })
  type: string;

}

