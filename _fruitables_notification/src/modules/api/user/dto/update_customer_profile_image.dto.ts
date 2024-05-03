import { ValidateNested, IsArray, IsOptional, IsString } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';
import { Type } from 'class-transformer';
import { MaxFileSize, IsFileMimeType } from 'src/decorators/file.decorators';

export class UpdateCustomerProfileImageDto {

  @IsString()
  @IsOptional()
  profile_image: string;

}

class UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
}

export class UpdateCustomerProfileImageFileDto {

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UploadedFile)
  @MaxFileSize(1048576)
  @IsFileMimeType(['image/jpg', 'image/jpeg', 'image/png']) 
  profile_image: Express.Multer.File[];

}

