import { IsString, IsNotEmpty, IsIn, ValidateNested, IsArray, IsOptional } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';
import { Type } from 'class-transformer';
import { MaxFileSize, IsFileMimeType } from 'src/decorators/file.decorators';

export class ProductCategoryAddDto {

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter value for category_name field') })
  category_name: string;

  @IsString()
  @IsIn(['Active', 'active', 'Inactive', 'inactive'])
  @IsNotEmpty({ message: () => custom.lang('Please enter value for status field') })
  status: string;

  @IsString()
  @IsOptional()
  category_images: string;

}

class UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
}

export class ProductCategoryAddFileDto {

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UploadedFile)
  @MaxFileSize(1048576)
  @IsFileMimeType(['image/jpg', 'image/jpeg', 'image/png']) 
  category_images: Express.Multer.File[];

}

