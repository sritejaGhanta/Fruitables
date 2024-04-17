import { IsArray, IsOptional, IsString, IsInt } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class ProductCategoryListDto {

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

