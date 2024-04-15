export default {
  customer_list: {
    api_name: 'Country List',
    fields: {
      country: {
        columnTitle: 'Country',
      },
      countryCode: {
        columnTitle: 'Country Code',
      },
      countryCodeISO3: {
        columnTitle: 'Country Code ISO3',
      },
      dialCode: {
        columnTitle: 'Dial Code',
      },
      status: {
        columnTitle: 'Status',
      },
      created_at: {
        columnTitle: 'Created Date',
        formatter: 'datetime',
      },
    },
  },
};
