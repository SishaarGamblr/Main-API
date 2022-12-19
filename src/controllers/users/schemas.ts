import { BasePropertiesSchema } from '../../entities/BaseEntity';
import { Schemas as ErrorSchemas } from '../../lib/errors/schemas';

export const UserResponse = {
  200: {
    type: 'object',
    properties: {
      ...BasePropertiesSchema,
      name: { type: 'string' },
      email: { type: 'string' },
      phone: { type: 'string' },
    },
  },
  '4xx': {
    ...ErrorSchemas.Error
  },
  '5xx': {
    ...ErrorSchemas.Error
  }
}

export const FindById = {
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' },
    },
    required: ['id']
  },
  response: UserResponse
}

export interface IFindByIdParams {
  id: string;
}

export const Create = {
  body: {
    type: 'object',
    properties: {
      email: { type: 'string' },
      phone: { type: 'string' },
      name: { type: 'string' },
    },
    required: ['email', 'phone', 'name'],
  },
  response: UserResponse
}

export interface ICreateBody {
  email: string;
  phone: string;
  name: string;
}

export const Delete = {
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' },
    },
    required: ['id']
  },
  response: {
    '2xx': { type: 'string' },
    '4xx': ErrorSchemas.Error,
  }
}

export interface IDeleteParams {
  id: string;
}