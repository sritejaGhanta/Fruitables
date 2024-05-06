import { IsString, IsOptional } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class GetUserSubscribeDtailsDto {
  @IsString()
  @IsOptional()
  user_subs_id: string;
}
