import { IsString, IsOptional } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';

export class RmqUserOtpUpdateDto {
  @IsString()
  @IsOptional()
  otp: string;

  @IsString()
  @IsOptional()
  id: string;
}
