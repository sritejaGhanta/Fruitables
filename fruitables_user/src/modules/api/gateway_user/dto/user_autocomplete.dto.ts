import { IsString, IsOptional } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class UserAutocompleteDto {

  @IsString()
  @IsOptional()
  keyword: string;

}

