import { ConsoleLogger, Injectable } from '@nestjs/common';

import { BaseService } from 'src/services/base.service';
import { CitGeneralLibrary } from 'src/utilities/cit-general-library';
import { ResponseLibrary } from 'src/utilities/response-library';
import { ResponseHandler } from 'src/utilities/response-handler';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class ImageResizeService extends BaseService {
  constructor(
    protected readonly general: CitGeneralLibrary,
    private readonly response: ResponseLibrary,
    protected readonly configService: ConfigService,
  ) {
    super();
  }

  async startImageResize(payload: string) {
    let success;
    let message;
    let fileObj;
    try {
      const encData = payload;
      const data = JSON.parse(
        await this.general.decryptData(encData, 'base64'),
      );

      const imgUrl = data.img_url;
      const ext = imgUrl.substr(imgUrl.lastIndexOf('.') + 1);
      const props = {
        picture: imgUrl,
        resize_width: data.edits.resize.width,
        resize_height: data.edits.resize.height,
        fit: data.edits.resize.fit,
        bg_color: data.edits.resize.background,
      };

      const upload_cache_dir = await this.general.getConfigItem(
        'upload_cache_path',
      );
      if (!this.general.isDirectory(upload_cache_dir)) {
        this.general.createFolder(upload_cache_dir);
      }

      const md5Url = await this.general.encryptData(
        JSON.stringify(props),
        'md5',
      );
      const srcPath = `${await this.general.getConfigItem(
        'upload_cache_path',
      )}${md5Url}.${ext}`;
      const dstPath = `${await this.general.getConfigItem(
        'upload_cache_path',
      )}${md5Url}_resize.${ext}`;

      const fileExists = this.general.isFile(dstPath);

      if (!fileExists) {
        await this.general.writeURLData(imgUrl, srcPath);
        data.src_path = srcPath;
        data.dst_path = dstPath;
        await this.general.getResizedImage(data);
      }

      fileObj = {
        download_name: `${md5Url}.${ext}`,
        download_path: dstPath,
        send_file: 1,
      };
      success = 1;
      message = 'Object found';
    } catch (err) {
      success = 0;
      message = 1;
    }

    const result = {
      settings: {
        success,
        message,
      },
      file: fileObj,
    };
    return result;
  }
}
