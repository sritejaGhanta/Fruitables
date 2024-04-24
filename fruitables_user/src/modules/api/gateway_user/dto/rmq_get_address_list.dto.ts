import { IsArray, IsNotEmpty } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class RmqGetAddressListDto {

  @IsArray()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the ids field.') })
  ids: any[];

}

