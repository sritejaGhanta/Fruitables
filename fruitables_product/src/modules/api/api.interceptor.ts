import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import * as _ from 'lodash';
import * as fs from 'fs';
import * as path from 'path';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Response } from 'express';

@Injectable()
export class ApiInterceptor implements NestInterceptor {
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      tap((result) => {
        if (result && _.isObject(result)) {
          try {
            const fileData: any = result['file'];
            if (fileData && _.isObject(fileData)) {
              const fullpath = fileData['download_path'];
              const filename = fileData['download_name'];

              if (fileData['download_export']) {
                const fileblobData = fileData['file_data'];
                response.setHeader(
                  'Access-Control-Expose-Headers',
                  `Custom-Filename`,
                );
                response.setHeader(
                  'Custom-Filename',
                  `${'file' + filename}`,
                );
                response.write(fileblobData);
              } else {
                const fileExtension = path.extname(fullpath).toLowerCase();
                const contentType = this.getContentType(fileExtension);
                const fileStream = fs.createReadStream(fullpath);
                fileStream.on('error', (error) => {
                  throw new InternalServerErrorException(
                    'Error streaming file to response.',
                  );
                });
                response.setHeader('Content-Type', contentType);
                if (fileData['send_file']) {
                  response.setHeader(
                    'Content-Disposition',
                    `inline; filename="${filename}"`,
                  );
                } else {
                  response.setHeader(
                    'Content-Disposition',
                    `attachment; filename="${filename}"`,
                  );
                }
                fileStream.pipe(response, { end: true });
                return of(null);
              }
            }
          } catch (error) {
            throw new InternalServerErrorException(error);
          }
        }
      }),
      catchError((error) => {
        if (error instanceof BadRequestException) {
          throw error;
        }
        throw new InternalServerErrorException(
          'Error streaming the file to response.',
        );
      }),
    );
  }

  private getContentType(fileExtension: string): string {
    switch (fileExtension) {
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';
      case '.gif':
        return 'image/gif';
      case '.csv':
        return 'text/csv';
      default:
        return 'application/octet-stream';
    }
  }
}
