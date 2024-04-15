import { Injectable } from '@nestjs/common';
import {
  S3Client,
  CreateBucketCommand,
  DeleteBucketCommand,
  HeadBucketCommand,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import * as fse from 'fs-extra';

import {
  CheckBucketDto,
  CheckFileDto,
  CreateBucketDto,
  DeleteBucketDto,
  DeleteFileDto,
  DeleteFilesDto,
  DownloadFileDto,
  GetBucketFilesDto,
  ListObjectsDto,
  UploadFileDto,
} from 'src/common/dto/amazon.dto';

import { PromiseResponseDto } from 'src/common/dto/common.dto';
import { CacheService } from './cache.service';
import { LoggerHandler } from 'src/utilities/logger-handler';

@Injectable()
export class AmazonService {
  private readonly log = new LoggerHandler(AmazonService.name).getInstance();
  protected type = 'aws';
  protected region = '';
  protected provider;

  constructor(private readonly cacheService: CacheService) {}

  setWasabi() {
    this.type = 'wasabi';
  }

  async initialize() {
    const endPoint = await this.cacheService.get('AWS_END_POINT');
    const accessKey = await this.cacheService.get('AWS_ACCESSKEY');
    const secretKey = await this.cacheService.get('AWS_SECRECTKEY');

    if (this.type === 'wasabi') {
      this.provider = new S3Client({
        credentials: {
          accessKeyId: accessKey,
          secretAccessKey: secretKey,
        },
        region: this.region,
      });
    } else {
      const awsRegion = endPoint;
      this.region = awsRegion ? awsRegion.trim() : 'us-east-1';

      this.provider = new S3Client({
        credentials: {
          accessKeyId: accessKey,
          secretAccessKey: secretKey,
        },
        region: this.region,
      });
    }
  }

  async checkBucket(options: CheckBucketDto) {
    let success: number;
    let message: string | object;
    let result: PromiseResponseDto;
    try {
      await this.initialize();
      const command = new HeadBucketCommand({
        Bucket: options.bucket_name,
      });

      if ('async' in options && options.async === false) {
        result = await this.provider
          .send(command)
          .then()
          .catch((error) => {
            this.log.error('[checkBucket::headBucket] >> Error', error);
            throw error;
          });
      } else {
        result = this.provider
          .send(command)
          .then((response) => {
            if (options?.callback) {
              options.callback(response, 1);
            }
          })
          .catch((error) => {
            this.log.error('[checkBucket::headBucket] >> Error', error);
            if (options?.callback) {
              options.callback(error, 0);
            }
            throw error;
          });
      }

      success = 1;
      message = 'Bucket status retrieved.';
    } catch (err) {
      success = 0;
      message = err;
      this.log.error('[checkBucket] >> Error', err);
    }

    return {
      success,
      message,
      result,
    };
  }

  async checkFile(options: CheckFileDto) {
    let success: number;
    let message: string | object;
    let result: PromiseResponseDto;
    try {
      await this.initialize();
      const command = new HeadObjectCommand({
        Bucket: options.bucket_name,
        Key: options.file_name,
      });

      if ('async' in options && options.async === false) {
        result = await this.provider
          .send(command)
          .then()
          .catch((error) => {
            this.log.error('[checkFile::headObject] >> Error', error);
            throw error;
          });
      } else {
        result = this.provider
          .send(command)
          .then((response) => {
            if (options?.callback) {
              options.callback(response, 1);
            }
          })
          .catch((error) => {
            this.log.error('[checkFile::headObject] >> Error', error);
            if (options?.callback) {
              options.callback(error, 0);
            }
            throw error;
          });
      }

      success = 1;
      message = 'File status retrieved.';
    } catch (err) {
      success = 0;
      message = err;
      this.log.error('[checkFile] >> Error', err);
    }
    return {
      success,
      message,
      result,
    };
  }

  async uploadFile(options: UploadFileDto) {
    let success: number;
    let message: string | object;
    let result: PromiseResponseDto;
    try {
      await this.initialize();
      const command = new PutObjectCommand({
        ACL: 'public-read',
        Bucket: options.bucket_name,
        Key: options.file_name,
        Body: fse.createReadStream(options.file_path),
        ContentType: options.mime_type,
        ContentLength: options.file_size,
      });

      if ('async' in options && options.async === false) {
        result = await this.provider
          .send(command)
          .then()
          .catch((error) => {
            this.log.error('[checkFile::upload] >> Error', error);
            throw error;
          });
      } else {
        result = this.provider
          .send(command)
          .then((response) => {
            if (options?.callback) {
              options.callback(response, 1);
            }
          })
          .catch((error) => {
            this.log.error('[uploadFile::upload] >> Error', error);
            if (options?.callback) {
              options.callback(error, 0);
            }
            throw error;
          });
      }
      success = 1;
      message = 'File uploaded successfully.';
    } catch (err) {
      success = 0;
      message = err;
      this.log.error('[uploadFile] >> Error', err);
    }
    return {
      success,
      message,
      result,
    };
  }

  async deleteFile(options: DeleteFileDto) {
    let success: number;
    let message: string | object;
    let result: PromiseResponseDto;
    try {
      await this.initialize();
      const command = new DeleteObjectCommand({
        Bucket: options.bucket_name,
        Key: options.file_name,
      });
      if ('async' in options && options.async === false) {
        result = await this.provider
          .send(command)
          .then()
          .catch((error) => {
            this.log.error('[deleteFile::deleteObject] >> Error', error);
            throw error;
          });
      } else {
        result = this.provider
          .send(command)
          .then((response) => {
            if (options?.callback) {
              options.callback(response, 1);
            }
          })
          .catch((error) => {
            this.log.error('[deleteFile::deleteObject] >> Error', error);
            if (options?.callback) {
              options.callback(error, 0);
            }
            throw error;
          });
      }
      success = 1;
      message = 'File deleted successfully.';
    } catch (err) {
      success = 0;
      message = err;
      this.log.error('[deleteFile] >> Error', err);
    }
    return {
      success,
      message,
      result,
    };
  }

  async deleteFiles(options: DeleteFilesDto) {
    let success: number;
    let message: string | object;
    let result: PromiseResponseDto;
    try {
      await this.initialize();

      const command = new DeleteObjectsCommand({
        Bucket: options.bucket_name,
        Delete: {
          Objects: options.file_names, //[{ Key: "object1.txt" }, { Key: "object2.txt" }], //for s3
        },
      });

      if ('async' in options && options.async === false) {
        result = await this.provider
          .send(command)
          .then()
          .catch((error) => {
            this.log.error('[deleteFiles::deleteObject] >> Error', error);
            throw error;
          });
      } else {
        result = this.provider
          .send(command)
          .then((response) => {
            if (options?.callback) {
              options.callback(response, 1);
            }
          })
          .catch((error) => {
            this.log.error('[deleteFiles::deleteObject] >> Error', error);
            if (options?.callback) {
              options.callback(error, 0);
            }
            throw error;
          });
      }
      success = 1;
      message = 'Files deleted successfully.';
    } catch (err) {
      success = 0;
      message = err;
      this.log.error('[deleteFiles] >> Error', err);
    }
    return {
      success,
      message,
      result,
    };
  }

  async downloadFile(options: DownloadFileDto) {
    let success: number;
    let message: string | object;
    let result: PromiseResponseDto;
    try {
      await this.initialize();

      const command = new GetObjectCommand({
        Bucket: options.bucket_name,
        Key: options.file_name,
      });

      if ('async' in options && options.async === false) {
        result = await this.provider
          .send(command)
          .then()
          .catch((error) => {
            this.log.error('[downloadFile::getObject] >> Error', error);
            throw error;
          });
      } else {
        result = this.provider
          .send(command)
          .then((response) => {
            if (options?.callback) {
              options.callback(response, 1);
            }
          })
          .catch((error) => {
            this.log.error('[downloadFile::getObject] >> Error', error);
            if (options?.callback) {
              options.callback(error, 0);
            }
            throw error;
          });
      }

      success = 1;
      message = 'File downloaded successfully.';
    } catch (err) {
      success = 0;
      message = err;
      this.log.error('[downloadFile] >> Error', err);
    }
    return {
      success,
      message,
      result,
    };
  }

  async createBucket(options: CreateBucketDto) {
    let success: number;
    let message: string | object;
    let result: PromiseResponseDto;
    try {
      await this.initialize();

      const command = new CreateBucketCommand({
        ACL: 'public-read',
        Bucket: options.bucket_name,
        CreateBucketConfiguration: {
          LocationConstraint: this.region,
        },
      });

      if ('async' in options && options.async === false) {
        result = await this.provider
          .send(command)
          .then()
          .catch((error) => {
            this.log.error('[createBucket::createBucket] >> Error', error);
            throw error;
          });
      } else {
        result = this.provider
          .send(command)
          .then((response) => {
            if (options?.callback) {
              options.callback(response, 1);
            }
          })
          .catch((error) => {
            this.log.error('[createBucket::createBucket] >> Error', error);
            if (options?.callback) {
              options.callback(error, 0);
            }
            throw error;
          });
      }
      success = 1;
      message = 'Bucket created successfully.';
    } catch (err) {
      success = 0;
      message = err;
      this.log.error('[createBucket] >> Error', err);
    }
    return {
      success,
      message,
      result,
    };
  }

  async deleteBucket(options: DeleteBucketDto) {
    let success: number;
    let message: string | object;
    let result: PromiseResponseDto;
    try {
      await this.initialize();
      const s3Client = this.provider;
      const command = new DeleteBucketCommand({
        Bucket: options.bucket_name,
      });

      if ('async' in options && options.async === false) {
        result = await this.provider
          .send(command)
          .then()
          .catch((error) => {
            this.log.error('[deleteBucket::deleteBucket] >> Error', error);
            throw error;
          });
      } else {
        result = this.provider
          .send(command)
          .then((response) => {
            if (options?.callback) {
              options.callback(response, 1);
            }
          })
          .catch((error) => {
            this.log.error('[deleteBucket::deleteBucket] >> Error', error);
            if (options?.callback) {
              options.callback(error, 0);
            }
            throw error;
          });
      }
      success = 1;
      message = 'Bucket deleted successfully.';
    } catch (err) {
      success = 0;
      message = err;
      this.log.error('[deleteBucket] >> Error', err);
    }
    return {
      success,
      message,
      result,
    };
  }

  async getBucketFiles(options: GetBucketFilesDto) {
    let success: number;
    let message: string | object;
    let result: PromiseResponseDto;
    try {
      await this.initialize();
      const listOpts: ListObjectsDto = {
        Bucket: options.bucket_name,
      };
      if (options?.prefix) {
        listOpts.Prefix = options.prefix;
      }
      if (options?.max_keys > 0) {
        listOpts.MaxKeys = options.max_keys;
      }
      if (options?.start_after) {
        listOpts.StartAfter = options.start_after;
      }
      if (options?.continuation_token) {
        listOpts.ContinuationToken = options.continuation_token;
      }

      const command = new ListObjectsV2Command(listOpts);

      if ('async' in options && options.async === false) {
        result = await this.provider
          .send(command)
          .then()
          .catch((error) => {
            this.log.error('[getBucketFiles::listObjectsV2] >> Error', error);
            throw error;
          });
      } else {
        result = this.provider
          .send(command)
          .then((response) => {
            if (options?.callback) {
              options.callback(response, 1);
            }
          })
          .catch((error) => {
            this.log.error('[getBucketFiles::listObjectsV2] >> Error', error);
            if (options?.callback) {
              options.callback(error, 0);
            }
            throw error;
          });
      }
      success = 1;
      message = 'Files retrieved successfully.';
    } catch (err) {
      success = 0;
      message = err;
    }
    return {
      success,
      message,
      result,
    };
  }
}
