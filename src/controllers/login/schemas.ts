import { Schemas as ErrorSchemas } from '../../lib/errors/schemas';

export const Login = {
  body: {
    type: 'object',
    properties: {
      phone: { type: 'string' },
      password: { type: 'string' },
    },
    required: ['phone', 'password']
  },
  response: {
    200: {
      type: 'object',
      properties: {
        token: { type: 'string' },
        refreshToken: { type: 'string' }
      },
    },
    '4xx': { ...ErrorSchemas.Error },
    '5xx': { ...ErrorSchemas.Error }
  }
}

export interface ILogin {
  phone: string,
  password: string
}

export const Refresh = {
  response: {
    200: {
      type: 'object',
      properties: {
        token: { type: 'string' },
        refreshToken: { type: 'string' }
      },
    },
    '4xx': { ...ErrorSchemas.Error },
    '5xx': { ...ErrorSchemas.Error }
  }
}

export const Logout = {
  response: {
    200: {
      type: 'string'
    },
    '4xx': { ...ErrorSchemas.Error },
    '5xx': { ...ErrorSchemas.Error }
  }
};

export const Verify = {
  response: {
    200: {
      type: 'string'
    },
    '4xx': { ...ErrorSchemas.Error },
    '5xx': { ...ErrorSchemas.Error }
  }
};

export interface IAuth {
  userId: string;
}