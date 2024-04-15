export interface FormConfigFieldInterface {
  name?: string;
  label?: string;
  label_code?: string;
  label_lang?: string;
  table_name?: string;
  table_alias?: string;
  field_name?: string;
  entry_type?: string;
  data_type?: string;
  type?: string;
  file_config?: boolean;
  file_server?: string;
  file_folder?: string;
  file_format?: string;
  file_size?: number;
  file_width?: string;
  file_height?: string;
  file_bgcolor?: string;
}

export interface ModuleServiceObjectInterface {
  serviceConfig: any;
  getFormConfiguration: any;
}

export interface ApiResponseInterface {
  serviceConfig: any;
  getFormConfiguration: any;
}
