import { IsString, IsOptional } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class CancelOrderDto {

}



export class CancelOrderParamDto {

  @IsString()
  @IsOptional()
  id: string;

}
