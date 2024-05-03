const routes = {
  post: {
    'api/gateway_user/add-subscriber': 'add_subscriber',
    'api/user/admin': 'admin_add',
    'api/auth/admin-change-password': 'admin_change_password',
    'api/user/admin-change-status': 'admin_change_status',
    'api/auth/admin-forgot-password': 'admin_forgot_password',
    'api/user/admin-list': 'admin_list',
    'api/auth/admin-login': 'admin_login',
    'api/auth/admin-logout': 'admin_logout',
    'api/auth/admin-reset-password': 'admin_reset_password',
    'api/auth/token-verification': 'admin_token_verification',
    'api/gateway_user/cart-item-add': 'cart_item_add',
    'api/gateway_user/cart-item-list': 'cart_item_list',
    'api/user/check-admin-email': 'check_admin_email',
    'api/user/check-customer-email': 'check_customer_email',
    'api/tools/city': 'city_add',
    'api/tools/city-change-status': 'city_change_status',
    'api/tools/city-list': 'city_list',
    'api/tools/country': 'country_add',
    'api/tools/country-change-status': 'country_change_status',
    'api/tools/country-list': 'country_list',
    'api/user/customer': 'customer_add',
    'api/auth/customer-change-password': 'customer_change_password',
    'api/user/customer-change-status': 'customer_change_status',
    'api/auth/customer-forgot-password': 'customer_forgot_password',
    'api/user/customer-list': 'customer_list',
    'api/auth/customer-login': 'customer_login',
    'api/auth/customer-logout': 'customer_logout',
    'api/auth/customer-registration': 'customer_registration',
    'api/auth/customer-reset-password': 'customer_reset_password',
    'api/auth/resend-admin-verify-email': 'resend_admin_verify_email',
    'api/auth/resend-customer-verify-email': 'resend_customer_verify_email',
    'api/gateway_user/rmq-clear-cart': 'rmq_clear_cart',
    'api/gateway_user/rmq-get-address-list': 'rmq_get_address_list',
    'api/gateway_user/rmq-get-cart-items-details': 'rmq_get_cart_items_details',
    'api/gateway_user/rmq-get-user-address': 'rmq_get_user_address',
    'api/gateway_user/rmq-get-user-details': 'rmq_get_user_details',
    'api/tools/settings-upload-files': 'settings_upload_files',
    'api/tools/state': 'state_add',
    'api/tools/state-list': 'state_list',
    'api/user/customer-profile': 'update_customer_details',
    'api/user/profile-image': 'update_customer_profile_image',
    'api/gateway_user/user-add': 'user_add',
    'api/gateway_user/user-address-add': 'user_address_add',
    'api/gateway_user/user-address-change-status': 'user_address_change_status',
    'api/gateway_user/user-address-list': 'user_address_list',
    'api/gateway_user/user-change-password': 'user_change_password',
    'api/gateway_user/user-change-status': 'user_change_status',
    'api/gateway_user/user-contact-us': 'user_contact_us',
    'api/gateway_user/user-forgot-password': 'user_forgot_password',
    'api/gateway_user/user-list': 'user_list',
    'api/gateway_user/user-login': 'user_login',
    'api/gateway_user/user-reset-password': 'user_rest_password',
    'api/auth/validate': 'validate_admin',
    'api/auth/verify-admin-email': 'verify_admin_email',
    'api/auth/verify-customer-email': 'verify_customer_email',
    'api/gateway_user/wishlist': 'wishlist',
    'api/gateway_user/wishlist-list': 'wishlist_list',
  },
  delete: {
    'api/user/admin/:id': 'admin_delete',
    'api/gateway_user/cart-item-delete/:cart_item_id': 'cart_item_delete',
    'api/tools/city/:id': 'city_delete',
    'api/tools/country/:id': 'country_delete',
    'api/user/customer/:id': 'customer_delete',
    'api/tools/state/:id': 'state_delete',
    'api/gateway_user/user-address-delete/:id': 'user_address_delete',
  },
  get: {
    'api/user/admin/:id': 'admin_details',
    'api/user/identity': 'admin_identity',
    'api/auth/capabilities': 'capabilities',
    'api/tools/city/:id': 'city_details',
    'api/tools/country/:id': 'country_details',
    'api/user/customer/:id': 'customer_details',
    'api/tools/general-settings': 'general_settings',
    'api/tools/dial-codes': 'get_country_dial_codes',
    'api/tools/countries': 'get_country_list',
    'api/user/customer-profile': 'get_customer_details',
    'api/tools/country-states': 'get_state_list',
    'api/user/group-capability-list': 'group_capability_list',
    'api/auth/menu': 'menu',
    'api/gateway_user/rmq-get-cart-details': 'rmq_get_cart_details',
    'api/gateway_user/rmq-get-users-list': 'rmq_get_users_list',
    'api/gateway_user/rmq-user-otp-update': 'rmq_user_otp_update',
    'api/tools/settings': 'settings',
    'api/tools/state/:id': 'state_details',
    'api/gateway_user/user-address-details/:id': 'user_address_details',
    'api/gateway_user/user-autocomplete': 'user_autocomplete',
    'api/gateway_user/user-details/:id': 'user_details',
    'api/gateway_user/wishlist-details': 'wishlist_details',
  },
  put: {
    'api/user/admin-profile-update': 'admin_profile_update',
    'api/user/admin/:id': 'admin_update',
    'api/gateway_user/cart-item-update/:id': 'cart_item_update',
    'api/tools/city/:id': 'city_update',
    'api/tools/country/:id': 'country_update',
    'api/user/customer/:id': 'customer_update',
    'api/user/group-capability-update/:id': 'group_capability_update',
    'api/tools/settings-update': 'settings_update',
    'api/tools/state/:id': 'state_update',
    'api/gateway_user/user-address-update/:id': 'user_address_update',
    'api/gateway_user/user-update/:id': 'user_update',
  },
};

export default routes;
