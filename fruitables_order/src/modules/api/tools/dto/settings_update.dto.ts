import { IsObject, IsNotEmpty } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class SettingsUpdateDto {

  @IsObject()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the setting field.') })
  setting: { [key: string]: any };

}

