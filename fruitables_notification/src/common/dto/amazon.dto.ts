export class CommonBucketDto {
  bucket_name: string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  callback?: Function;
  async?: boolean;
}
export class CreateBucketDto extends CommonBucketDto {}
export class DeleteBucketDto extends CommonBucketDto {}
export class CheckBucketDto extends CommonBucketDto {}
export class CheckFileDto extends CommonBucketDto {
  file_name: string;
}
export class UploadFileDto extends CommonBucketDto {
  file_name: string;
  file_path: string;
  mime_type?: string;
  file_size?: number;
}
export class DeleteFileDto extends CommonBucketDto {
  file_name: string;
}
export class DeleteFilesDto extends CommonBucketDto {
  file_names: DeleteFilesObject[];
}
class DeleteFilesObject {
  Key: string;
}
export class DownloadFileDto extends CommonBucketDto {
  file_name: string;
}
export class GetBucketFilesDto extends CommonBucketDto {
  prefix?: string;
  max_keys?: number;
  start_after?: string;
  continuation_token?: string;
}

export class ListObjectsDto {
  Bucket: string;
  Prefix?: string;
  MaxKeys?: number;
  StartAfter?: string;
  ContinuationToken?: string;
}

export class ImageResizeDto {
  src_path?: string;
  dst_path?: string;
  img_url?: string;
  bucket?: string;
  key?: string;
  edits?: {
    resize?: {
      width?: number;
      height?: number;
      fit?: keyof ImageResizeFit;
      background?: any;
    };
  };
  flatten?: {
    background?: any;
  };
}

export interface ImageResizeFit {
  contain: 'contain';
  cover: 'cover';
  fill: 'fill';
  inside: 'inside';
  outside: 'outside';
}

export class ResizeOptionsDto {
  resize_mode?: keyof ImageResizeFit;
  background?: string;
  color?: string;
  source?: string;
  path?: string;
  image_name?: string;
}

export class UploadedPathDto {
  bucket_name?: string;
  folder_name?: string;
  folder_path?: string;
  folder_url?: string;
}

export class FileAttributesDto {
  file_name?: string;
  file_ext?: string;
  file_cat?: string;
}

export class StaticImgOptsDto {
  no_img_req?: boolean;
  extensions?: string;
  no_img_val?: string;
}

export class FileFetchDto {
  source?: string;
  image_name?: string;
  nested_key?: string;
  extensions?: string;
  no_img_req?: boolean;
  no_img_val?: string;
  resize_mode?: keyof ImageResizeFit;
  width?: number;
  height?: number;
  path?: string;
  color?: string;
  fit?: string;
}

export class FileUploadDto {
  source?: string;
  upload_path?: string;
  src_file: string;
  dst_file: string;
  extensions?: string;
  file_type?: string;
  file_size?: number;
  max_size?: number;
  async?: boolean;
}
