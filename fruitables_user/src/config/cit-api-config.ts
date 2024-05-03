const config = {
  add_subscriber: {
    title: 'Add Subscriber',
    folder: 'gateway_user',
    method: 'post',
    params: ['email'],
    format: 'object',
  },
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
    action: 'create',
    access: 'admin-portal-1-0',
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
  cart_item_add: {
    title: 'Cart Item Add',
    folder: 'gateway_user',
    method: 'post',
    params: ['product_id', 'product_qty'],
    format: 'object',
    action: 'verify',
    access: 'user-login-1-0',
  },
  cart_item_delete: {
    title: 'Cart Item Delete',
    folder: 'gateway_user',
    method: 'delete',
    params: ['product_id', 'cart_item_id'],
    format: 'object',
    action: 'verify',
    access: 'user-login-1-0',
  },
  cart_item_list: {
    title: 'Cart Item List',
    folder: 'gateway_user',
    method: 'post',
    params: [],
    format: 'array',
    action: 'verify',
    access: 'user-login-1-0',
  },
  cart_item_update: {
    title: 'Cart Item Update',
    folder: 'gateway_user',
    method: 'put',
    params: ['id', 'change_quantity'],
    format: 'object',
    action: 'verify',
    access: 'user-login-1-0',
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
  get_state_list: {
    title: 'Get State List',
    folder: 'tools',
    method: 'get',
    params: ['country_id', 'keyword'],
    format: 'array',
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
  rmq_clear_cart: {
    title: 'Rmq Clear Cart',
    folder: 'gateway_user',
    method: 'post',
    params: ['user_id', 'cart_id'],
    format: 'object',
  },
  rmq_get_address_list: {
    title: 'Rmq Get Address List',
    folder: 'gateway_user',
    method: 'post',
    params: ['ids'],
    format: 'object',
  },
  rmq_get_cart_items_details: {
    title: 'Rmq Get Cart  Items Details',
    folder: 'gateway_user',
    method: 'post',
    params: ['cart_id'],
    format: 'object',
  },
  rmq_get_cart_details: {
    title: 'Rmq get cart details',
    folder: 'gateway_user',
    method: 'get',
    params: ['user_id'],
    format: 'object',
  },
  rmq_get_user_address: {
    title: 'Rmq Get User Address',
    folder: 'gateway_user',
    method: 'post',
    params: ['id'],
    format: 'object',
  },
  rmq_get_user_details: {
    title: 'Rmq Get User Details',
    folder: 'gateway_user',
    method: 'post',
    params: ['id'],
    format: 'object',
  },
  rmq_get_users_list: {
    title: 'Rmq Get Users List',
    folder: 'gateway_user',
    method: 'get',
    params: ['ids'],
    format: 'object',
  },
  rmq_user_otp_update: {
    title: 'Rmq User Otp Update',
    folder: 'gateway_user',
    method: 'get',
    params: ['otp', 'id'],
    format: 'object',
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
  user_add: {
    title: 'User Add',
    folder: 'gateway_user',
    method: 'post',
    params: [
      'first_name',
      'last_name',
      'email',
      'password',
      'phone_number',
      'dial_code',
    ],
    format: 'object',
  },
  user_address_add: {
    title: 'User Address Add',
    folder: 'gateway_user',
    method: 'post',
    params: [
      'land_mark',
      'address',
      'state_name',
      'country_name',
      'pin_code',
      'status',
      'first_name',
      'last_name',
      'company_name',
      'email',
      'phone_number',
      'dial_code',
    ],
    format: 'object',
    action: 'verify',
    access: 'user-login-1-0',
  },
  user_address_change_status: {
    title: 'User Address Change Status',
    folder: 'gateway_user',
    method: 'post',
    params: ['ids', 'status'],
    format: 'object',
    action: 'verify',
    access: 'user-login-1-0',
  },
  user_address_delete: {
    title: 'User Address Delete',
    folder: 'gateway_user',
    method: 'delete',
    params: ['id'],
    format: 'object',
    action: 'verify',
    access: 'user-login-1-0',
  },
  user_address_details: {
    title: 'User Address Details',
    folder: 'gateway_user',
    method: 'get',
    params: ['id'],
    format: 'object',
    action: 'verify',
    access: 'user-login-1-0',
  },
  user_address_list: {
    title: 'User Address List',
    folder: 'gateway_user',
    method: 'post',
    params: [],
    format: 'array',
    action: 'verify',
    access: 'user-login-1-0',
  },
  user_address_update: {
    title: 'User Address Update',
    folder: 'gateway_user',
    method: 'put',
    params: [
      'id',
      'land_mark',
      'address',
      'state_name',
      'country_name',
      'pin_code',
      'status',
      'first_name',
      'last_name',
      'company_name',
      'email',
      'phone_number',
      'dial_code',
    ],
    format: 'object',
    action: 'verify',
    access: 'user-login-1-0',
  },
  user_autocomplete: {
    title: 'User Autocomplete',
    folder: 'gateway_user',
    method: 'get',
    params: ['keyword'],
    format: 'array',
  },
  user_change_password: {
    title: 'User Change Password',
    folder: 'gateway_user',
    method: 'post',
    params: ['password', 'new_password'],
    format: 'object',
    action: 'verify',
    access: 'user-login-1-0',
  },
  user_change_status: {
    title: 'User Change Status',
    folder: 'gateway_user',
    method: 'post',
    params: ['ids', 'status'],
    format: 'object',
  },
  user_contact_us: {
    title: 'User Contact Us',
    folder: 'gateway_user',
    method: 'post',
    params: ['name', 'email', 'message'],
    format: 'object',
  },
  user_details: {
    title: 'User Details',
    folder: 'gateway_user',
    method: 'get',
    params: ['id'],
    format: 'object',
  },
  user_forgot_password: {
    title: 'User Forgot Password',
    folder: 'gateway_user',
    method: 'post',
    params: ['email'],
    format: 'object',
  },
  user_list: {
    title: 'User List',
    folder: 'gateway_user',
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
  user_login: {
    title: 'User Login',
    folder: 'gateway_user',
    method: 'post',
    params: ['email', 'password'],
    format: 'object',
    action: 'create',
    access: 'user-login-1-0',
  },
  user_rest_password: {
    title: 'User Rest Password',
    folder: 'gateway_user',
    method: 'post',
    params: ['otp', 'email', 'password'],
    format: 'object',
  },
  user_update: {
    title: 'User Update',
    folder: 'gateway_user',
    method: 'put',
    params: [
      'id',
      'first_name',
      'last_name',
      'profile_image',
      'phone_number',
      'dial_code',
    ],
    format: 'object',
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
  wishlist: {
    title: 'Wishlist Add Update',
    folder: 'gateway_user',
    method: 'post',
    params: ['product_id'],
    format: 'object',
    action: 'verify',
    access: 'user-login-1-0',
  },
  wishlist_details: {
    title: 'Wishlist Details',
    folder: 'gateway_user',
    method: 'get',
    params: [],
    format: 'object',
    action: 'verify',
    access: 'user-login-1-0',
  },
  wishlist_list: {
    title: 'Wishlist List',
    folder: 'gateway_user',
    method: 'post',
    params: [],
    format: 'array',
    action: 'verify',
    access: 'user-login-1-0',
  },
};

export default config;
