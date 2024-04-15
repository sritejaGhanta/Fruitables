import {
  Scope,
  Injectable,
  NestMiddleware,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { REQUEST } from '@nestjs/core';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user: object;
    }
  }
}

import * as _ from 'lodash';
import apiConfig from '../config/cit-api-config';
import * as custom from '../utilities/custom-helper';
import { LoggerHandler } from 'src/utilities/logger-handler';

import { JwtTokenService } from 'src/services/jwt-token.service';
import { EncryptService } from 'src/services/encrypt.service';
import {
  ResponseHandler,
  ResponseHandlerInterface,
} from 'src/utilities/response-handler';

@Injectable({ scope: Scope.REQUEST })
export class AuthMiddleware implements NestMiddleware {
  constructor(
    @Inject(REQUEST) private request: Request,
    protected readonly jwtTokenService: JwtTokenService,
    protected readonly encryptService: EncryptService,
  ) {}

  private readonly log = new LoggerHandler(AuthMiddleware.name).getInstance();

  async use(req: Request, res: Response, next: NextFunction) {
    const actions = [
      'verify',
      'verify-create',
      'optional-verify',
      'optional-create',
    ];

    const apiName = custom.getRouteAPIName(
      req.baseUrl,
      req.method.toLowerCase(),
    );

    if (
      _.isObject(apiConfig[apiName]) &&
      'action' in apiConfig[apiName] &&
      actions.includes(apiConfig[apiName].action)
    ) {
      let apiToken;
      if (req.headers && req.headers.authorization) {
        const parts = req.headers.authorization.split(' ');
        const scheme = parts[0];
        const credentials = parts[1];
        if (/^Bearer$/i.test(scheme)) {
          apiToken = credentials;
        }
      } else if (req.query && req.query.access_token) {
        apiToken = req.query.access_token;
      } else if (req.body && req.body.access_token) {
        apiToken = req.body.access_token;
      }

      const response = await this.jwtTokenService.verifyAPIToken(
        apiName,
        apiConfig,
        apiToken,
      );
      if (
        !response.success &&
        apiConfig[apiName].action !== 'optional-verify'
      ) {
        const success = -1;
        const message = response.message || 'Authentication token failed.';
        const result: ResponseHandlerInterface = ResponseHandler.standard(
          HttpStatus.UNAUTHORIZED,
          success,
          message,
          {},
        );
        return res.status(result.settings.status).json(result);
      }

      let payload = { ...response.payload, token: apiToken };

      if (
        response.success &&
        response.verify_api &&
        response.verify_api in apiConfig
      ) {
        // TODO: Verify API
        const verifyAPI = response.verify_api;
        const folderPath = apiConfig[verifyAPI].folder;
        const verifyPath = `../api/services/${folderPath}/${verifyAPI}.service`;
        const verifyController = await import(verifyPath);

        // const VerifyInstance = verifyController.default;
        // const verifyObject = new VerifyInstance();
        const verifyObject = verifyController.default;
        const verifyMethod = custom.snakeToCamel(`start_${verifyAPI}`);
        const verifyResult = await verifyObject[verifyMethod](req, payload);

        if (!('settings' in verifyResult) || !verifyResult.settings.success) {
          const success = -1;
          const message =
            verifyResult.settings.message || 'Token verification failed.';
          const result: ResponseHandlerInterface = ResponseHandler.standard(
            HttpStatus.UNAUTHORIZED,
            success,
            message,
            {},
          );
          return res.status(result.settings.status).json(result);
        }

        if (_.isObject(verifyResult.data)) {
          payload = { ...payload, ...verifyResult.data };
        }
      }

      req.user = payload;
    }

    // TODO: need to test this code
    // const tokenEncryption: string = await this.cacheService.get('WS_TOKEN_ENCRYPTION');
    // if (tokenEncryption === 'Y') {
    //   let wsToken;
    //   if (req.headers && (req.headers.citwstoken || req.headers['cit-ws-token'])) {
    //     wsToken = req.headers.citwstoken || req.headers['cit-ws-token'];
    //   } else if (req.query && req.query.ws_token) {
    //     wsToken = req.query.ws_token;
    //   } else if (req.body && req.body.ws_token) {
    //     wsToken = req.body.ws_token;
    //   }
    //   if (req.headers && req.headers['user-agent']) {
    //     this.encryptService.setUserAgent(req.headers['user-agent']);
    //   }
    //   this.encryptService.setIPAddres(custom.getIPAddress(req));
    //   const response = await this.encryptService.validateWSToken(wsToken);
    //   if (response && response.success !== 1) {
    //     const success = response.success;
    //     const message = response.message || 'API token failed.';
    //      const result: ResponseHandlerInterface = ResponseHandler.standard(
    //        HttpStatus.UNAUTHORIZED,
    //        success,
    //        message,
    //        {},
    //      );
    //     return res.status(result.settings.status).json(result);
    //   }
    // }

    next();
  }

  // async checkCapability(req: Request, next: NextFunction) {
  //   let endPoint: string = req.baseUrl.replace('/api/', '');
  //   const reqMethod: string = req.method;
  //   let capability;

  //   const pointsList = endPoint.split('/');
  //   if (pointsList.length === 2) {
  //     if (/^\w+$/i.test(pointsList[1])) {
  //       endPoint = pointsList[0] + '/*';
  //     }
  //   }
  //   if (pointsList.length === 3) {
  //     if (/^\w+$/i.test(pointsList[2])) {
  //       endPoint = pointsList[0] + '/' + pointsList[1] + '/*';
  //     }
  //   }

  //   if (reqMethod === 'GET') {
  //     capability = GET_METHODS[endPoint];
  //   } else if (reqMethod === 'POST') {
  //     capability = POST_METHODS[endPoint];
  //   } else if (reqMethod === 'PUT') {
  //     capability = PUT_METHODS[endPoint];
  //   } else if (reqMethod === 'DELETE') {
  //     capability = DELETE_METHODS[endPoint];
  //   }

  //   if (!capability) {
  //     this.log.debug(
  //       `No capability found for route : ${endPoint} | method : ${reqMethod}`,
  //     );
  //     return next();
  //   }

  //   this.log.debug(
  //     `capability for route : ${endPoint} | method : ${reqMethod} | capability : ${capability}`,
  //   );

  //   // TODO: Check Role Capabilities
  // }
}
