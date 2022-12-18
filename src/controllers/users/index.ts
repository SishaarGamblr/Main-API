import fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from 'fastify';
import Container, { Inject, Service } from 'typedi';
import { UserService } from '../../services/users';
import { CreateUserDTO, UserResponseSchema } from '../../entities/User';
import { NotFoundError } from '../../lib/errors/errors';
import { request } from 'http';
import { ErrorPropertiesSchema } from '../../lib/errors/schema';

const usersService = Container.get(UserService);

export default async (fastify: FastifyInstance) => {
  fastify.get(
    '/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
        response: UserResponseSchema,
      },
    },
    async function findById(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) {
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
      schema: {
        response: UserResponseSchema,
      },
    },
    async function create(
      request: FastifyRequest<{ Body: CreateUserDTO }>,
      reply: FastifyReply
    ) {
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
      schema: {
        response: {
          '2xx': { type: 'string' },
          '4xx': ErrorPropertiesSchema,
        },
      },
    },
    async function create(
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) {
      await usersService.delete(request.params.id);

      reply.code(200).send('ok');
    }
  );
};
