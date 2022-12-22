import { BasePropertiesSchema } from "../../entities/BaseEntity"
import { Schemas as ErrorSchemas } from '../../lib/errors/schemas';

export const TransactionResponse = {
  200: {
    type: 'object',
    properties: {
      ...BasePropertiesSchema,
      amount: { type: 'number' },
      fromId: { type: 'string' },
      toId: { type: 'string' },
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
  response: TransactionResponse
}

export interface IFindByIdParams {
  id: string;
}

export const Create = {
  body: {
    type: 'object',
    properties: {
      fromId: { type: 'string' },
      toId: { type: 'string' },
      amount: { type: 'number' }
    },
    required: ['fromId', 'toId', 'amount']
  },
  response: TransactionResponse
}

export interface ICreateBody {
  fromId: string;
  toId: string;
  amount: number;
}