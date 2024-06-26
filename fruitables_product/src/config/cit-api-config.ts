const config = {
  admin_add: {
    title: 'Admin Add',
    folder: 'user',
    method: 'post',
    params: [
      'name',
      'email',
      'username',
      'dial_code',
      'phone_number',
      'group_id',
      'status',
    ],
    format: 'object',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  admin_change_password: {
    title: 'Admin Change Password',
    folder: 'auth',
    method: 'post',
    params: ['old_password', 'new_password'],
    format: 'object',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  admin_change_status: {
    title: 'Admin Change Status',
    folder: 'user',
    method: 'post',
    params: ['ids', 'status'],
    format: 'object',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  admin_delete: {
    title: 'Admin Delete',
    folder: 'user',
    method: 'delete',
    params: ['id'],
    format: 'object',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  admin_details: {
    title: 'Admin Details',
    folder: 'user',
    method: 'get',
    params: ['id'],
    format: 'object',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  admin_forgot_password: {
    title: 'Admin Forgot Password',
    folder: 'auth',
    method: 'post',
    params: ['email'],
    format: 'object',
  },
  admin_identity: {
    title: 'Admin Identity',
    folder: 'user',
    method: 'get',
    params: [],
    format: 'object',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  admin_list: {
    title: 'Admin List',
    folder: 'user',
    method: 'post',
    params: [
      'filters',
      'keyword',
      'limit',
      'page',
      'sort',
      'key',
      'value',
      'prop',
      'dir',
    ],
    format: 'array',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  admin_login: {
    title: 'Admin Login',
    folder: 'auth',
    method: 'post',
    params: ['email', 'password'],
    format: 'object',
  },
  admin_logout: {
    title: 'Admin Logout',
    folder: 'auth',
    method: 'post',
    params: [],
    format: 'object',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  admin_profile_update: {
    title: 'Admin Profile Update',
    folder: 'user',
    method: 'put',
    params: ['name', 'email', 'dial_code', 'phone_number'],
    format: 'object',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  admin_reset_password: {
    title: 'Admin Reset Password',
    folder: 'auth',
    method: 'post',
    params: ['otp_code', 'password', 'token'],
    format: 'object',
  },
  admin_token_verification: {
    title: 'Admin Token Verification',
    folder: 'auth',
    method: 'post',
    params: ['token'],
    format: 'object',
  },
  admin_update: {
    title: 'Admin Update',
    folder: 'user',
    method: 'put',
    params: [
      'id',
      'name',
      'email',
      'username',
      'dial_code',
      'phone_number',
      'group_id',
      'status',
    ],
    format: 'object',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  capabilities: {
    title: 'Capabilities',
    folder: 'auth',
    method: 'get',
    params: [],
    format: 'object',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  check_admin_email: {
    title: 'Check Admin Email',
    folder: 'user',
    method: 'post',
    params: ['email', 'id'],
    format: 'object',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  check_customer_email: {
    title: 'Check Customer Email',
    folder: 'user',
    method: 'post',
    params: ['email', 'id'],
    format: 'object',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  city_add: {
    title: 'City Add',
    folder: 'tools',
    method: 'post',
    params: ['city_name', 'city_code', 'country_id', 'state_id', 'status'],
    format: 'object',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  city_change_status: {
    title: 'City Change Status',
    folder: 'tools',
    method: 'post',
    params: ['ids', 'status'],
    format: 'array',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  city_delete: {
    title: 'City Delete',
    folder: 'tools',
    method: 'delete',
    params: ['id'],
    format: 'object',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  city_details: {
    title: 'City Details',
    folder: 'tools',
    method: 'get',
    params: ['id'],
    format: 'object',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  city_list: {
    title: 'City List',
    folder: 'tools',
    method: 'post',
    params: [
      'filters',
      'keyword',
      'limit',
      'page',
      'sort',
      'key',
      'value',
      'prop',
      'dir',
    ],
    format: 'object',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  city_update: {
    title: 'City Update',
    folder: 'tools',
    method: 'put',
    params: [
      'id',
      'city_name',
      'city_code',
      'country_id',
      'state_id',
      'status',
    ],
    format: 'object',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  country_add: {
    title: 'Country Add',
    folder: 'tools',
    method: 'post',
    params: [
      'country_name',
      'country_code',
      'country_code_iso3',
      'description',
      'status',
      'dial_code',
    ],
    format: 'array',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  country_change_status: {
    title: 'Country Change Status',
    folder: 'tools',
    method: 'post',
    params: ['ids', 'status'],
    format: 'object',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  country_delete: {
    title: 'Country Delete',
    folder: 'tools',
    method: 'delete',
    params: ['id'],
    format: 'object',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  country_details: {
    title: 'Country Details',
    folder: 'tools',
    method: 'get',
    params: ['id'],
    format: 'object',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  country_list: {
    title: 'Country List',
    folder: 'tools',
    method: 'post',
    params: [
      'filters',
      'keyword',
      'limit',
      'page',
      'sort',
      'key',
      'value',
      'prop',
      'dir',
    ],
    format: 'array',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  country_update: {
    title: 'Country Update',
    folder: 'tools',
    method: 'put',
    params: [
      'id',
      'country_name',
      'country_code_iso3',
      'description',
      'country_code',
      'status',
      'dial_code',
    ],
    format: 'object',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  customer_add: {
    title: 'Customer Add',
    folder: 'user',
    method: 'post',
    params: [
      'first_name',
      'last_name',
      'email',
      'profile_image',
      'dial_code',
      'phone_number',
      'status',
    ],
    format: 'object',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  customer_change_password: {
    title: 'Customer Change Password',
    folder: 'auth',
    method: 'post',
    params: ['old_password', 'new_password'],
    format: 'object',
    action: 'verify',
    access: 'mobile-portal-1-0',
  },
  customer_change_status: {
    title: 'Customer Change Status',
    folder: 'user',
    method: 'post',
    params: ['ids', 'status'],
    format: 'object',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  customer_delete: {
    title: 'Customer Delete',
    folder: 'user',
    method: 'delete',
    params: ['id'],
    format: 'object',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  customer_details: {
    title: 'Customer Details',
    folder: 'user',
    method: 'get',
    params: ['id'],
    format: 'object',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  customer_forgot_password: {
    title: 'Customer Forgot Password',
    folder: 'auth',
    method: 'post',
    params: ['email'],
    format: 'object',
  },
  customer_list: {
    title: 'Customer List',
    folder: 'user',
    method: 'post',
    params: [
      'filters',
      'keyword',
      'limit',
      'page',
      'sort',
      'key',
      'value',
      'prop',
      'dir',
    ],
    format: 'array',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  customer_login: {
    title: 'Customer Login',
    folder: 'auth',
    method: 'post',
    params: ['email', 'password'],
    format: 'object',
    action: 'create',
    access: 'mobile-portal-1-0',
  },
  customer_logout: {
    title: 'Customer Logout',
    folder: 'auth',
    method: 'post',
    params: [],
    format: 'object',
    action: 'verify',
    access: 'mobile-portal-1-0',
  },
  customer_registration: {
    title: 'Customer Registration',
    folder: 'auth',
    method: 'post',
    params: ['first_name', 'last_name', 'email', 'password'],
    format: 'object',
  },
  customer_reset_password: {
    title: 'Customer Reset Password',
    folder: 'auth',
    method: 'post',
    params: ['customer_id', 'otp_code', 'password'],
    format: 'object',
  },
  customer_update: {
    title: 'Customer Update',
    folder: 'user',
    method: 'put',
    params: [
      'id',
      'first_name',
      'last_name',
      'profile_image',
      'dial_code',
      'phone_number',
      'status',
    ],
    format: 'object',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  dashboard_products: {
    title: 'Dashboard Products',
    folder: 'gateway_product',
    method: 'post',
    params: [],
    format: 'object',
  },
  faq_add: {
    title: 'Faq Add',
    folder: 'gateway_product',
    method: 'post',
    params: ['product_id', 'question_name', 'answer'],
    format: 'object',
  },
  faq_list: {
    title: 'Faq List',
    folder: 'gateway_product',
    method: 'post',
    params: ['keyword', 'product_id'],
    format: 'array',
  },
  faq_update: {
    title: 'Faq Update',
    folder: 'gateway_product',
    method: 'put',
    params: ['id', 'product_id', 'question_name', 'answer'],
    format: 'object',
  },
  general_settings: {
    title: 'General Settings',
    folder: 'tools',
    method: 'get',
    params: ['type'],
    format: 'object',
  },
  get_country_dial_codes: {
    title: 'Get Country Dial Codes',
    folder: 'tools',
    method: 'get',
    params: ['keyword'],
    format: 'array',
  },
  get_country_list: {
    title: 'Get Country List',
    folder: 'tools',
    method: 'get',
    params: ['keyword'],
    format: 'array',
  },
  get_customer_details: {
    title: 'Get Customer Details',
    folder: 'user',
    method: 'get',
    params: [],
    format: 'object',
    action: 'verify',
    access: 'mobile-portal-1-0',
  },
  get_product_and_reviews_count: {
    title: 'Get Product and Reviews Count',
    folder: 'gateway_product',
    method: 'get',
    params: [],
    format: 'object',
  },
  get_state_list: {
    title: 'Get State List',
    folder: 'tools',
    method: 'get',
    params: ['country_id', 'keyword'],
    format: 'array',
  },
  get_top_5_ratings: {
    title: 'get Top 10 Ratings',
    folder: 'gateway_product',
    method: 'get',
    params: [],
    format: 'object',
  },
  group_capability_list: {
    title: 'Group Capability List',
    folder: 'user',
    method: 'get',
    params: [],
    format: 'array',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  group_capability_update: {
    title: 'Group Capability Update',
    folder: 'user',
    method: 'put',
    params: ['id', 'capabilities'],
    format: 'object',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  menu: {
    title: 'Menu',
    folder: 'auth',
    method: 'get',
    params: [],
    format: 'array',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  product_category_add: {
    title: 'Product Category Add',
    folder: 'gateway_product',
    method: 'post',
    params: ['category_name', 'status', 'category_images'],
    format: 'object',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  product_category_autocomplete: {
    title: 'Product Category Autocomplete',
    folder: 'gateway_product',
    method: 'get',
    params: ['keyword'],
    format: 'array',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  product_category_change_status: {
    title: 'Product Category Change Status',
    folder: 'gateway_product',
    method: 'post',
    params: ['ids', 'status'],
    format: 'object',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  product_category_delete: {
    title: 'Product Category Delete',
    folder: 'gateway_product',
    method: 'delete',
    params: ['id'],
    format: 'object',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  product_category_details: {
    title: 'Product Category Details',
    folder: 'gateway_product',
    method: 'get',
    params: ['id'],
    format: 'object',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  product_category_list: {
    title: 'Product Category List',
    folder: 'gateway_product',
    method: 'post',
    params: [
      'filters',
      'key',
      'value',
      'keyword',
      'limit',
      'page',
      'sort',
      'prop',
      'dir',
    ],
    format: 'array',
  },
  product_category_update: {
    title: 'Product Category Update',
    folder: 'gateway_product',
    method: 'put',
    params: ['id', 'category_name', 'status', 'category_images'],
    format: 'object',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  product_reviews_list: {
    title: 'Product Review List',
    folder: 'gateway_product',
    method: 'post',
    params: ['product_id'],
    format: 'array',
  },
  product_reviews_add: {
    title: 'Product Reviews Add',
    folder: 'gateway_product',
    method: 'post',
    params: ['product_id', 'review', 'rating', 'user_id'],
    format: 'object',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  product_reviews_delete: {
    title: 'Product Reviews Delete',
    folder: 'gateway_product',
    method: 'delete',
    params: ['id', 'user_id'],
    format: 'object',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  product_reviews_update: {
    title: 'Product Reviews Update',
    folder: 'gateway_product',
    method: 'put',
    params: ['id', 'product_id', 'user_id', 'review', 'rating'],
    format: 'object',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  products_add: {
    title: 'Products Add',
    folder: 'gateway_product',
    method: 'post',
    params: [
      'product_name',
      'product_image',
      'product_cost',
      'product_description',
      'product_category_id',
      'status',
      'offer_type',
    ],
    format: 'object',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  products_autocomplete: {
    title: 'Products Autocomplete',
    folder: 'gateway_product',
    method: 'get',
    params: ['keyword'],
    format: 'array',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  products_change_status: {
    title: 'Products Change Status',
    folder: 'gateway_product',
    method: 'post',
    params: ['ids', 'status'],
    format: 'object',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  products_delete: {
    title: 'Products Delete',
    folder: 'gateway_product',
    method: 'delete',
    params: ['id'],
    format: 'object',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  products_details: {
    title: 'Products Details',
    folder: 'gateway_product',
    method: 'get',
    params: ['id'],
    format: 'object',
  },
  products_list: {
    title: 'Products List',
    folder: 'gateway_product',
    method: 'post',
    params: [
      'filters',
      'key',
      'value',
      'keyword',
      'limit',
      'page',
      'sort',
      'prop',
      'dir',
      'review_products',
    ],
    format: 'array',
  },
  products_update: {
    title: 'Products Update',
    folder: 'gateway_product',
    method: 'put',
    params: [
      'id',
      'product_name',
      'product_image',
      'product_cost',
      'product_description',
      'product_category_id',
      'status',
      'offer_type',
    ],
    format: 'object',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  resend_admin_verify_email: {
    title: 'Resend Admin Verify Email',
    folder: 'auth',
    method: 'post',
    params: [],
    format: 'object',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  resend_customer_verify_email: {
    title: 'Resend Customer Verify Email',
    folder: 'auth',
    method: 'post',
    params: [],
    format: 'object',
    action: 'verify',
    access: 'mobile-portal-1-0',
  },
  rmq_get_product_details: {
    title: 'Rmq Get Product Details',
    folder: 'gateway_product',
    method: 'post',
    params: ['id'],
    format: 'object',
  },
  rmq_get_products_list: {
    title: 'RMQ Get Products List',
    folder: 'gateway_product',
    method: 'post',
    params: ['ids'],
    format: 'array',
  },
  settings: {
    title: 'Settings',
    folder: 'tools',
    method: 'get',
    params: ['type'],
    format: 'object',
  },
  settings_update: {
    title: 'Settings Update',
    folder: 'tools',
    method: 'put',
    params: ['setting', ''],
    format: 'object',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  settings_upload_files: {
    title: 'Settings Upload Files',
    folder: 'tools',
    method: 'post',
    params: ['setting_key', 'setting_file'],
    format: 'object',
  },
  state_add: {
    title: 'State Add',
    folder: 'tools',
    method: 'post',
    params: ['state_name', 'state_code', 'country_id', 'status'],
    format: 'object',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  state_delete: {
    title: 'State Delete',
    folder: 'tools',
    method: 'delete',
    params: ['id'],
    format: 'object',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  state_details: {
    title: 'State Details',
    folder: 'tools',
    method: 'get',
    params: ['id'],
    format: 'object',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  state_list: {
    title: 'State List',
    folder: 'tools',
    method: 'post',
    params: [
      'country_id',
      'filters',
      'keyword',
      'limit',
      'page',
      'sort',
      'key',
      'value',
      'prop',
      'dir',
    ],
    format: 'array',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  state_update: {
    title: 'State Update',
    folder: 'tools',
    method: 'put',
    params: ['id', 'state_name', 'state_code', 'country_id', 'status'],
    format: 'object',
    action: 'verify',
    access: 'admin-portal-1-0',
  },
  update_customer_details: {
    title: 'Update Customer Details',
    folder: 'user',
    method: 'post',
    params: ['first_name', 'last_name', 'dial_code', 'phone_number'],
    format: 'object',
    action: 'verify',
    access: 'mobile-portal-1-0',
  },
  update_customer_profile_image: {
    title: 'Update Customer Profile Image',
    folder: 'user',
    method: 'post',
    params: ['profile_image'],
    format: 'object',
    action: 'verify',
    access: 'mobile-portal-1-0',
  },
  validate_admin: {
    title: 'Validate Admin',
    folder: 'auth',
    method: 'post',
    params: ['email'],
    format: 'array',
  },
  verify_admin_email: {
    title: 'Verify Admin Email',
    folder: 'auth',
    method: 'post',
    params: ['verify_token'],
    format: 'object',
  },
  verify_customer_email: {
    title: 'Verify Customer Email',
    folder: 'auth',
    method: 'post',
    params: ['verify_token'],
    format: 'object',
  },
};

export default config;
