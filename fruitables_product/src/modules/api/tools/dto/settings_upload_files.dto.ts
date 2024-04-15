import { IsString, IsNotEmpty, ValidateNested, IsArray, IsOptional } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';
import { Type } from 'class-transformer';
import { MaxFileSize, IsFileMimeType } from 'src/decorators/file.decorators';

export class SettingsUploadFilesDto {

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the setting_key field.') })
  setting_key: string;

  @IsString()
  @IsOptional()
  setting_file: string;

}

class UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
}

export class SettingsUploadFilesFileDto {

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UploadedFile)
  @MaxFileSize(1048576)
  @IsFileMimeType(['image/jpg', 'image/jpeg', 'image/png']) 
  setting_file: Express.Multer.File[];

}

