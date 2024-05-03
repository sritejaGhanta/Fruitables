export interface ResponseDataInterface {
  message?: string;
  status?: number;
  data?: any;
}

export interface SettingsHandlerInterface {
  status?: number;
  success: number;
  message: string;
  access_token?: string;
  count?: number;
  per_page?: number;
  curr_page?: number;
  last_page?: number;
  prev_page?: boolean;
  next_page?: boolean;
}

export interface ResponseHandlerInterface {
  settings?: SettingsHandlerInterface;
  data?: any;
}

export interface ExternalResponseHandlerInterface {
  success: number;
  message: string;
  data?: any;
  info?: {
    status_code?: number;
    error_code?: string;
    error_message?: string;
  };
}

export class ResponseHandler {
  static error(status: number, message: string): ResponseDataInterface {
    const response: ResponseHandlerInterface = {
      settings: {
        status: status,
        success: 0,
        message: message,
      },
      data: {},
    };
    return response;
  }

  static success(status: number, data: any): ResponseDataInterface {
    const response: ResponseHandlerInterface = {
      settings: {
        status: status,
        success: 1,
        message: '',
      },
      data,
    };
    return response;
  }

  static standard(
    status: number,
    success: number,
    message: string,
    data: any,
  ): ResponseDataInterface {
    const response: ResponseHandlerInterface = {
      settings: {
        status: status,
        success: success,
        message: message,
      },
      data: data,
    };
    return response;
  }
}
