import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import * as Schemas from './schemas';
import Container from 'typedi';
import { LeaguesService } from '../../services/leagues';
import { NotFoundError } from '../../lib/errors/errors';
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
      const leaguesService = Container.get(LeaguesService);
      const league = await leaguesService.findOne(request.params.id);

      if (!league) {
        reply.send(new NotFoundError(request.params.id));
      }

      reply.send(league);
    }
  );

  fastify.post(
    '/',
    {
      schema: Schemas.Create,
      preHandler: [fastify.authenticate]
    },
    async function create(
      request: FastifyRequest,
      reply: FastifyReply
    ) {
      const body = request.body as Schemas.ICreateBody;
      const auth = request.user as IAuth

      const leaguesService = Container.get(LeaguesService);
      const league = await leaguesService.create({
        name: body.name,
        ownerId: auth.userId,
      });

      reply.send(league);
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: Schemas.Delete,
      preHandler: [fastify.authenticate]
    },
    async function deleteLeague(
      request: FastifyRequest,
      reply: FastifyReply
    ) {
      const params = request.params as Schemas.IDeleteParams;
      const { userId } = request.user as IAuth;

      const leaguesService = Container.get(LeaguesService);
      await leaguesService.delete(params.id, { ownerId: userId });

      reply.code(200).send('ok');
    }
  );

  fastify.put(
    '/:id/invite/:userId',
    {
      schema: Schemas.InviteUser,
      preHandler: [fastify.authenticate]
    },
    async function inviteUser(
      request: FastifyRequest,
      reply: FastifyReply
    ) {
      const params = request.params as Schemas.IInviteUserParams;

      const { userId } = request.user as IAuth;

      const leaguesService = Container.get(LeaguesService);
      await leaguesService.inviteUser(params.id, params.userId, userId);

      reply.code(200).send('ok');
    }
  );
};
