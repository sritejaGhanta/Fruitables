import { IsString, IsOptional, IsArray, IsInt } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class StateListDto {

  @IsString()
  @IsOptional()
  country_id: string;

  @IsArray()
  @IsOptional()
  filters: any;

  @IsString()
  @IsOptional()
  keyword: string;

  @IsInt()
  @IsOptional()
  limit: number;

  @IsInt()
  @IsOptional()
  page: number;

  @IsArray()
  @IsOptional()
  sort: any;

}

