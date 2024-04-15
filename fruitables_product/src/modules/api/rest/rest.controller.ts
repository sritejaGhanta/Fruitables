import {
  Controller,
  Post,
  Req,
  Request,
  Param,
  Query,
  Body,
  Get,
  Delete,
  UploadedFiles,
  UseInterceptors,
  NotFoundException,
  Res,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import { Response } from 'express';

import { CitGeneralLibrary } from 'src/utilities/cit-general-library';
import { CreateTokenService } from './services/create_token.service';
import { ImageResizeService } from './services/image_resize.service';
import { ModuleService } from 'src/services/module.service';
@Controller()
export class RestController {
  constructor(
    protected readonly general: CitGeneralLibrary,
    private createTokenService: CreateTokenService,
    private imageResizeService: ImageResizeService,
    private moduleService: ModuleService,
  ) {}

  @Get('create-token')
  async createToken(@Req() request: Request, @Body() body: any) {
    const params = body;
    return await this.createTokenService.test(params);
  }

  @Delete('delete-file')
  async deleteFile(
    @Req() request: Request,
    @Param() param: any,
    @Body() body: any,
  ) {
    const params = { ...body, ...param };
    const result = await this.moduleService.deleteFormFile(params);
    return result;
  }

  @Get('download-file')
  async downloadFile(
    @Req() request: Request,
    @Res() res: Response,
    @Query() query: any,
  ) {
    const params = query;
    const result = await this.moduleService.downloadFormFile(params);
    return result;
  }

  @Get('image-resize/:payload')
  async imageResize(@Param('payload') payload: string, @Res() res: Response) {
    const result = await this.imageResizeService.startImageResize(payload);
    return result;
  }

  @Post('upload-file')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'file_data' }]))
  async uploadFile(
    @Req() request: Request,
    @Body() body: any,
    @UploadedFiles() files: Record<string, Express.Multer.File[]>,
  ) {
    const params = body;
    const reqFiles = {};

    if (typeof files !== 'undefined' && Object.keys(files).length > 0) {
      for (const [key, value] of Object.entries(files)) {
        const fieldFiles = files[key];
        for (const file of fieldFiles) {
          reqFiles[key] = file;
        }
      }
    }

    const result = await this.moduleService.uploadFormFile(params, reqFiles);
    return result;
  }
}
