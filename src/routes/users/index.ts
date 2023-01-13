import { FastifyInstance } from 'fastify';
import * as Schemas from './schemas';
import * as Controllers from './controllers';

export default async (fastify: FastifyInstance) => {
  fastify.get(
    '/:id',
    {
      schema: Schemas.FindById,
    },
    Controllers.findById
  );

  fastify.post(
    '/',
    {
      schema: Schemas.Create,
    },
    Controllers.create
  );

  fastify.delete(
    '/:id',
    {
      schema: Schemas.Delete,
    },
    Controllers.deleteUser
  );
};
