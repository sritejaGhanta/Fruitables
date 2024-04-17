const access = {
  'admin-portal-1-0': {
    api_key: 'dju9me8XuyrVGbLHi3x0TzgKNgO79AYj',
    client_name: 'Admin Portal',
    client_version: '1.0',
    expiry_date:  '',
    token_info: {
      algorithm: 'HS256',
      issuer: 'self',
      audience: 'self',
      expiry: 20,
    },
    api_info: {
      create: '',
      verify: '',
      payload: {
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
      issuer: 'self',
      audience: 'self',
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
};

export default access;
