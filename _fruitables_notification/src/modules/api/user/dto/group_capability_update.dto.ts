import { IsString, IsNotEmpty, IsArray } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class GroupCapabilityUpdateDto {

  @IsArray()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the capabilities field.') })
  capabilities: any[];

}



export class GroupCapabilityUpdateParamDto {

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the id field.') })
  id: string;

}
