import { IsString, IsNotEmpty, ValidateNested, IsArray, IsOptional } from 'class-validator';
import * as custom from 'src/utilities/custom-helper';
import { Type } from 'class-transformer';
import { MaxFileSize, IsFileMimeType } from 'src/decorators/file.decorators';

export class CustomerUpdateDto {

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the first_name field.') })
  first_name: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the last_name field.') })
  last_name: string;

  @IsString()
  @IsOptional()
  profile_image: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the dial_code field.') })
  dial_code: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the phone_number field.') })
  phone_number: string;

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the status field.') })
  status: string;

}

class UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
}

export class CustomerUpdateFileDto {

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UploadedFile)
  @MaxFileSize(1048576)
  @IsFileMimeType(['image/jpg', 'image/jpeg', 'image/png']) 
  profile_image: Express.Multer.File[];

}



export class CustomerUpdateParamDto {

  @IsString()
  @IsNotEmpty({ message: () => custom.lang('Please enter a value for the id field.') })
  id: string;

}
