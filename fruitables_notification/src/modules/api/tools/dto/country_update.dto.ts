import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class CountryUpdateDto {

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the country_name field.') })
  country_name: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the country_code_iso3 field.') })
  country_code_iso3: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the country_code field.') })
  country_code: string;

  @IsString()
  @IsIn(['active', 'inactive', 'Active', 'Inactive'])
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the status field.') })
  status: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the dial_code field.') })
  dial_code: string;

}



export class CountryUpdateParamDto {

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the id field.') })
  id: string;

}
