import { IsArray, IsOptional } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class RmqGetProductsListDto {

  @IsArray()
  @IsOptional()
  ids: any[];

}

