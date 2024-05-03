module.exports = {
  apps: [
    {
      name: 'fruitables-notification-api',
      script: 'dist/main.js',
      watch: false,
      out_file: '/dev/null',
      error_file: '/dev/null',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      env: {
        PORT: '3001',
        DEBUG: 'api:*',
        NODE_ENV: 'development',
        DB_CLIENT: 'mysql',
        DB_HOST: '#SERVER#',
        DB_USER: '#USERNAME#',
        DB_PASS: '#PASSWORD#',
        DB_NAME: '#DATABASE#',
        DB_PORT: "#DB_PORT#",
        DB_DEBUG: 1,
        DATA_SECRET: 'CIT@DATA!',
      }
    }
  ]
};
