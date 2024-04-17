import { IsArray, IsOptional, IsString, IsInt } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class CartItemListDto {

  @IsArray()
  @IsOptional()
  filters: any;

  @IsString()
  @IsOptional()
  keyword: string;

  @IsInt()
  @IsOptional()
  limit: number;

  @IsArray()
  @IsOptional()
  sort: any;

}

