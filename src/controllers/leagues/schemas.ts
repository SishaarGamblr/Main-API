import { BasePropertiesSchema } from '../../entities/BaseEntity';
import { Schemas as ErrorSchemas } from '../../lib/errors/schemas';

export const LeagueResponse = {
  200: {
    type: 'object',
    properties: {
      ...BasePropertiesSchema,
      name: { type: 'string' },
      ownerId: { type: 'string' },
    },
  },
  '4xx': {
    ...ErrorSchemas.Error,
  },
  '5xx': {
    ...ErrorSchemas.Error,
  },
};

export const FindById = {
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' },
    },
    required: ['id'],
  },
  response: LeagueResponse,
};

export interface IFindByIdParams {
  id: string;
}

export const Create = {
  body: {
    type: 'object',
    properties: {
      ownerId: { type: 'string' },
      name: { type: 'string' },
    },
    required: ['ownerId', 'name'],
  },
  response: LeagueResponse,
};

export interface ICreateBody {
  name: string;
  ownerId: string;
}

export const Delete = {
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' },
    },
    required: ['id'],
  },
  response: {
    '2xx': { type: 'string' },
    '4xx': ErrorSchemas.Error,
  },
};

export interface IDeleteParams {
  id: string;
}
