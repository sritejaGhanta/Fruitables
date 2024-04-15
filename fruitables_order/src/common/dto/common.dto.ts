export class StandardResultDto {
  success?: number;
  message?: string;
  status?: number;
}

export class StandardReturnDto {
  success?: number;
  message?: string;
}

export class PromiseResponseDto {
  data?: any;
  error?: any;
}

export class StandardPromiseDto {
  success?: number;
  message?: string;
  status?: number;
  error?: any;
  data?: any;
}

export class StandardCallbackDto {
  // eslint-disable-next-line @typescript-eslint/ban-types
  callback?: Function;
  async?: boolean;
}

export class DynamicKeyAnyDto {
  [key: string]: any;
}

export class DynamicKeyStrDto {
  [key: string]: string;
}

export class DynamicKeyNumDto {
  [key: string]: number;
}

export class DynamicKeyMixDto {
  [key: string]: string | number;
}

export class BlockResultDto {
  success?: number;
  message?: string;
  data?: any;
}

export class SettingsParamsDto {
  status?: number;
  success?: number;
  message?: string;
  access_token?: string;
  count?: number;
  per_page?: number;
  curr_page?: number;
  last_page?: number;
  prev_page?: boolean;
  next_page?: boolean;
}
