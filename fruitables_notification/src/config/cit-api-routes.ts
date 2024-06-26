const routes = {
    'post': { 
        'api/user/admin': 'admin_add',
        'api/auth/admin-change-password': 'admin_change_password',
        'api/user/admin-change-status': 'admin_change_status',
        'api/auth/admin-forgot-password': 'admin_forgot_password',
        'api/user/admin-list': 'admin_list',
        'api/auth/admin-login': 'admin_login',
        'api/auth/admin-logout': 'admin_logout',
        'api/auth/admin-reset-password': 'admin_reset_password',
        'api/auth/token-verification': 'admin_token_verification',
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
        'api/tools/settings-upload-files': 'settings_upload_files',
        'api/tools/state': 'state_add',
        'api/tools/state-list': 'state_list',
        'api/user/customer-profile': 'update_customer_details',
        'api/user/profile-image': 'update_customer_profile_image',
        'api/auth/validate': 'validate_admin',
        'api/auth/verify-admin-email': 'verify_admin_email',
        'api/auth/verify-customer-email': 'verify_customer_email',
    },
    'delete': { 
        'api/user/admin/:id': 'admin_delete',
        'api/tools/city/:id': 'city_delete',
        'api/tools/country/:id': 'country_delete',
        'api/user/customer/:id': 'customer_delete',
        'api/tools/state/:id': 'state_delete',
    },
    'get': { 
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
        'api/tools/settings': 'settings',
        'api/tools/state/:id': 'state_details',
    },
    'put': { 
        'api/user/admin-profile-update': 'admin_profile_update',
        'api/user/admin/:id': 'admin_update',
        'api/tools/city/:id': 'city_update',
        'api/tools/country/:id': 'country_update',
        'api/user/customer/:id': 'customer_update',
        'api/user/group-capability-update/:id': 'group_capability_update',
        'api/tools/settings-update': 'settings_update',
        'api/tools/state/:id': 'state_update',
    },
};

export default routes;
