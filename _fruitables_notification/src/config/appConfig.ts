import { registerAs } from '@nestjs/config';
import { join } from 'path';

const rootPath = join(process.env.PWD, '/');

const publicFolder = 'public';
const uploadFolder = 'upload';

const publicPath = `${rootPath}${publicFolder}/`;
const publicURL = `${publicFolder}/`; //const publicURL = `${process.env.API_URL}/${publicFolder}/`;

export default registerAs('app', () => ({
  apiPort: process.env.PORT,
  nodeEnv: process.env.NODE_ENV,
  dataSecret: process.env.DATA_SECRET,
  redisHost: process.env.REDIS_HOST,
  redisPort: process.env.REDIS_PORT,

  public_folder: publicFolder,
  upload_folder: uploadFolder,
  imagic_install_dir: '/usr/bin/',

  upload_path: `${publicPath}${uploadFolder}/`,
  upload_url: `${publicURL}${uploadFolder}/`,

  upload_temp_path: `${publicPath}${uploadFolder}/temp_files/`,
  upload_temp_url: `${publicURL}${uploadFolder}/temp_files/`,

  settings_files_path: `${publicPath}${uploadFolder}/settings_files/`,
  settings_files_url: `${publicURL}${uploadFolder}/settings_files/`,

  query_log_path: `${publicPath}logs/queries/`,
  request_log_path: `${publicPath}logs/requests/`,
  upload_cache_path: `${publicPath}cache/img/`,

  settings_files_config: {
    upload_folder: 'settings_files',
    aws_vars_list: ['COMPANY_LOGO', 'COMPANY_FAVICON', 'UPLOAD_NOIMAGE'],
  },

  enable_access_log: true,
  enable_query_log: true,

  upload_max_size: 51200,
  allowed_extensions: 'jpg,jpeg,jpe,jpf,jpg2,jpx,jpm,png,gif,bmp,ico,svg',

  default_admin_users: ['admin', 'hbadmin'],
  default_admin_groups: ['admin', 'hbadmin'],

  restrict_admin_users: ['hbadmin'],
  restrict_admin_groups: ['hbadmin'],

  admin_password_history: 5,
  admin_lf_display_limit: 10,
  admin_lf_dropdown_limit: 100,
  admin_dd_pagination_limit: 1000,
  admin_download_files_limit: 1000,
  admin_switch_dropdown_limit: 2000,

  cache_expiry_time: 30 * 60 * 1000, // (30 minutes)
  max_cache_allowed: 1000,
  OTP_EXPIRY_SECONDS: 900,
  NOTIFICATIONS_CHUNK_SIZE: 50,

  enable_notification_queue: false,
}));
