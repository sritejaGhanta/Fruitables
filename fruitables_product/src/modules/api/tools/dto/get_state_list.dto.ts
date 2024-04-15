import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class GetStateListDto {

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the country_id field.') })
  country_id: string;

  @IsString()
  @IsOptional()
  keyword: string;

}

