import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseHandler } from 'src/utilities/response-handler';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const status = exception.getStatus();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    let errMessage: string;
    if (typeof exception.getResponse === 'function') {
      const responseObject = exception.getResponse();
      if (status === 400) {
        errMessage =
          responseObject && typeof responseObject === 'object'
            ? responseObject['message']
            : responseObject || 'Internal Server Error';
      } else {
        errMessage =
          responseObject && typeof responseObject === 'object'
            ? (Array.isArray(responseObject['message'])
                ? responseObject['message'][0]
                : responseObject['message']) || 'Internal Server Error'
            : responseObject || 'Internal Server Error';
      }
    } else {
      errMessage = exception.message || 'Internal Server Error';
    }

    if (request.path.slice(0, 5) === '/api/') {
      const apiResponse = ResponseHandler.error(status, errMessage);
      response.status(status).json(apiResponse);
    } else {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        message: errMessage,
        path: request.url,
      });
    }
  }
}
