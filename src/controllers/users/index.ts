import {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from 'fastify';
import Container from 'typedi';
import { UserService } from '../../services/users';
import { NotFoundError } from '../../lib/errors/errors';
import * as Schemas from './schemas';

export default async (fastify: FastifyInstance) => {
  fastify.get(
    '/:id',
    {
      schema: Schemas.FindById
    },
    async function findById(
      request: FastifyRequest<{ Params: Schemas.IFindByIdParams }>,
      reply: FastifyReply
    ) {
      const usersService = Container.get(UserService);
      const user = await usersService.findOne(request.params.id);

      if (!user) {
        reply.send(new NotFoundError(request.params.id));
      }

      reply.send(user);
    }
  );

  fastify.post(
    '/',
    {
      schema: Schemas.Create
    },
    async function create(
      request: FastifyRequest<{ Body: Schemas.ICreateBody }>,
      reply: FastifyReply
    ) {
      const usersService = Container.get(UserService);
      const user = await usersService.create({
        email: request.body.email,
        phone: request.body.phone,
        name: request.body.name,
      });

      reply.send(user);
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: Schemas.Delete
    },
    async function create(
      request: FastifyRequest<{ Params: Schemas.IDeleteParams }>,
      reply: FastifyReply
    ) {
      const usersService = Container.get(UserService);
      await usersService.delete(request.params.id);

      reply.code(200).send('ok');
    }
  );
};
