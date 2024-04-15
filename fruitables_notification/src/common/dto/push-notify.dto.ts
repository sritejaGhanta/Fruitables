import {
  CODE,
  DEVICE,
  MODE,
  SILENT,
  STATUS,
  TYPE,
} from 'src/common/enum/common.enum';
import { DynamicKeyMixDto } from './common.dto';

export class PushTemplateDto {
  templateTitle: string;
  templateCode: string;
  title: string;
  message: string;
  sound?: string;
  badge?: number;
  image?: string;
  color?: string;
  silent?: SILENT;
  priority?: string;
  collapseKey?: string;
  sendInterval?: number;
  expireInterval?: number;
  varsJson?: any; //PushVariableDto[];
}
export class PushVariableDto {
  var_name?: string;
}

export class ProcessPushDto {
  push_title?: string;
  push_message?: string;
  key_values: DynamicKeyMixDto;
}

export class SendPushOptionsDto {
  device_token: string;
  code?: CODE;
  title?: string;
  message?: string;
  sound?: string;
  badge?: number;
  image?: string;
  icon?: string;
  color?: string;
  silent?: SILENT;
  priority?: string;
  collapse_key?: string;
  send_after?: number;
  expire_after?: number;
  send_mode?: string;
  params?: DynamicKeyMixDto;
  data?: DynamicKeyMixDto;
  // eslint-disable-next-line @typescript-eslint/ban-types
  callback?: Function;
  skiplog?: boolean;
  async?: boolean;
}
export class SendPushParamsDto {
  template_code?: string;
  template_title?: string;
}
export class PushSendJsonDto {
  payload?: any;
}

export class SendPushObjectDto {
  title: string;
  body: string;
  alert?: {
    title?: string;
    body?: string;
  };
  topic?: string;
  sound?: string;
  badge?: number;
  image?: string;
  icon?: string;
  color?: string;
  priority?: string;
  collapseKey?: string;
  contentAvailable?: boolean;
  expire?: number;
  custom?: { [key: string]: string | number };
  id?: number;
  async?: boolean;
}

export class PushLoggerDto {
  deviceId: string;
  mode?: MODE;
  type?: TYPE;
  notifyCode?: CODE;
  title?: string;
  message?: string;
  sound?: string;
  badge?: number;
  silent?: SILENT;
  image?: string;
  color?: string;
  priority?: string;
  collapseKey?: string;
  code?: string;
  varsJSON?: string;
  sendJSON?: string;
  pushTime?: string;
  expireTime?: string;
  expireInterval?: number;
  deviceType?: DEVICE;
  error?: string;
  status?: STATUS;
  executedAt?: string;
}

export class PushNotifyConsumerInputDto {
  notify_data: any;
  token_list?: any;
}
