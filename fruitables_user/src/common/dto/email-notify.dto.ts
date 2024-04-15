import { STATUS, TYPE } from 'src/common/enum/common.enum';
import { DynamicKeyMixDto } from './common.dto';

export class EmailTemplateDto {
  emailCode: string;
  emailTitle: string;
  fromName?: string;
  fromEmail?: string;
  replyToName?: string;
  replyToEmail?: string;
  ccEmail?: string;
  bccEmail?: string;
  emailSubject?: string;
  emailMessage?: string;
  varsJson?: any; //EmailVariableDto[];
}
export class EmailVariableDto {
  var_name?: string;
}
export class EmailConfigVarsDto {
  company_name?: string;
  copyright_text?: string;
  site_url?: string;
  logo?: string;
}

export class ProcessEmailDto {
  email_subject?: string;
  email_message?: string;
  from_name?: string;
  from_email?: string;
  key_values?: DynamicKeyMixDto;
}

export class SendEmailOptionsDto {
  to_email: string;
  email_subject?: string;
  email_message?: string;
  from_name?: string;
  from_email?: string;
  replyto_name?: string;
  replyto_email?: string;
  cc_email?: string;
  bcc_email?: string;
  attachments?: EmailAttachmentsDto[];
  variables?: DynamicKeyMixDto;
  params?: DynamicKeyMixDto;
  // eslint-disable-next-line @typescript-eslint/ban-types
  callback?: Function;
  skiplog?: boolean;
  async?: boolean;
  new_priority?: string;
}
export class EmailAttachmentsDto {
  filename: string;
  path?: string;
}
export class SendEmailParamsDto {
  email_code?: string;
  email_title?: string;
}

export class SendEmailObjectDto {
  to: string;
  from?: string;
  subject?: string;
  template?: string;
  replyTo?: string;
  inReplyTo?: string;
  cc?: string;
  bcc?: string;
  attachments?: EmailAttachmentsDto[];
  transporterName?: string;
  variables?: any;
  context?: any;
  new_priority?: string;
  async?: boolean;
  callback?: Function;
  skiplog?: boolean;
  id?: number;
  uniq_id?: number;
}

export class EmailLoggerDto {
  receiver: string;
  subject?: string;
  content?: string;
  type?: TYPE;
  params?: string;
  error?: string;
  code?: string;
  status?: STATUS;
  executedAt?: string;
}
