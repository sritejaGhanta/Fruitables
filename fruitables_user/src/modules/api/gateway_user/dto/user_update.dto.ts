import { IsString, IsNotEmpty, ValidateNested, IsArray, IsOptional } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';
import { Type } from 'class-transformer';
import { MaxFileSize, IsFileMimeType } from 'src/decorators/file.decorators';

export class UserUpdateDto {

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter value for first_name field') })
  first_name: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter value for last_name field') })
  last_name: string;

  @IsString()
  @IsOptional()
  profile_image: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter value for phone_number field') })
  phone_number: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter value for dial_code field') })
  dial_code: string;

}

class UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
}

export class UserUpdateFileDto {

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UploadedFile)
  @MaxFileSize(1048576)
  @IsFileMimeType(['image/jpg', 'image/jpeg', 'image/png']) 
  profile_image: Express.Multer.File[];

}



export class UserUpdateParamDto {

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter value for id field') })
  id: string;

}
