import { BasePropertiesSchema } from '../../entities/BaseEntity';
import { Schemas as ErrorSchemas } from '../../lib/errors/schemas';

/** Serializing a League object */

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

/** Find League By ID */

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

/** Create League */

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

/** Delete League */

export const Delete = {
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' },
    },
    required: ['id'],
  },
  response: {
    '200': { type: 'string' },
    '4xx': ErrorSchemas.Error,
    '5xx': ErrorSchemas.Error
  },
};

export interface IDeleteParams {
  id: string;
}

/** Invite User to League */
export const InviteUser = {
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      userId: { type: 'string' },
    },
    required: ['id', 'userId'],
  },
  response: {
    '200': { type: 'string' },
    '4xx': ErrorSchemas.Error,
    '5xx': ErrorSchemas.Error
  }
}

export interface IInviteUserParams {
  id: string;
  userId: string;
}
