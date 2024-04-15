import { STATUS, TYPE } from 'src/common/enum/common.enum';
import { DynamicKeyMixDto } from './common.dto';

export class SmsTemplateDto {
  templateTitle: string;
  templateCode: string;
  message: string;
  varsJson?: any; // SmsVariableDto[];
}
export class SmsVariableDto {
  var_name?: string;
}

export class ProcessSmsDto {
  sms_message?: string;
  key_values: DynamicKeyMixDto;
}

export class SendSmsOptionsDto {
  number: string;
  message?: string;
  params?: DynamicKeyMixDto;
  // eslint-disable-next-line @typescript-eslint/ban-types
  callback?: Function;
  skiplog?: boolean;
  async?: boolean;
  priority?: string;
  id?: number;
}
export class SendSmsParamsDto {
  template_code?: string;
  template_title?: string;
}
export class SmsSendJsonDto {
  payload?: any;
}

export class SendSmsObjectDto {
  to: string;
  from?: string;
  body?: string;
}

export class SmsLoggerDto {
  receiver: string;
  message?: string;
  error?: string;
  type?: TYPE;
  code?: string;
  status?: STATUS;
  executedAt?: string;
}
