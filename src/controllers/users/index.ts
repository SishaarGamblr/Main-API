import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import Container from 'typedi';
import { UserService } from '../../services/users';
import { ForbiddenError, NotFoundError } from '../../lib/errors/errors';
import * as Schemas from './schemas';
import { IAuth } from '../login/schemas';

export default async (fastify: FastifyInstance) => {
  fastify.get(
    '/:id',
    {
      schema: Schemas.FindById,
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
      schema: Schemas.Create,
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
        password: request.body.password
      });

      reply.send(user);
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: Schemas.Delete,
      preHandler: [fastify.authenticate]
    },
    async function deleteUser(
      request: FastifyRequest,
      reply: FastifyReply
    ) {
      const params = request.params as Schemas.IDeleteParams;
      const { userId } = request.user as IAuth;

      if (params.id !== userId) {
        reply.send(new ForbiddenError())
      }

      const usersService = Container.get(UserService);
      await usersService.delete(params.id);

      reply.code(200).send('ok');
    }
  );
};
