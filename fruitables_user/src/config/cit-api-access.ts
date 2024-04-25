const access = {
  'admin-portal-1-0': {
    api_key: 'dju9me8XuyrVGbLHi3x0TzgKNgO79AYj',
    client_name: 'Admin Portal',
    client_version: '1.0',
    expiry_date:  '',
    token_info: {
      algorithm: 'HS256',
      issuer: 'http://localhost:3067',
      audience: 'http://localhost:3067',
      expiry: 20,
    },
    api_info: {
      create: 'admin_login',
      verify: '',
      payload: {
        id: 'id',
        email: 'email',
        group_id: 'group_id',
      },
      required: [
      ],
    }
  },
  'mobile-portal-1-0': {
    api_key: 'ji4xf53OlOlxp3PxpShY92CfGym9nF2G',
    client_name: 'Mobile Portal',
    client_version: '1.0',
    expiry_date:  '',
    token_info: {
      algorithm: 'HS256',
      issuer: 'http://localhost:3067',
      audience: 'http://localhost:3067',
      expiry: 20,
    },
    api_info: {
      create: 'customer_login',
      verify: '',
      payload: {
        id: 'id',
        email: 'email',
      },
      required: [
        'id',
        'email',
      ],
    }
  },
  'user-login-1-0': {
    api_key: 'dju9me8XuyrVGbLHi3x0TzgKNgO79AYj',
    client_name: 'User Login',
    client_version: '1.0',
    expiry_date:  '',
    token_info: {
      algorithm: 'HS256',
      issuer: 'http://localhost:3067',
      audience: 'http://localhost:3067',
      expiry: 20,
    },
    api_info: {
      create: 'user_login',
      verify: '',
      payload: {
        user_id: 'user_id',
        email: 'email',
        profile_image: 'profile_image',
        first_name: 'first_name',
        last_name: 'last_name',
        phone_number: 'phone_number',
        dial_code: 'dial_code',
        status: 'status',
        profile_image_name: 'profile_image_name',
        cart_id: 'cart_id',
      },
      required: [
      ],
    }
  },
};

export default access;
