import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import * as Schemas from './schemas';
import Container from "typedi";
import { LeaguesService } from "../../services/leagues";
import { NotFoundError } from "../../lib/errors/errors";

export default async (fastify: FastifyInstance) => {
  fastify.get(
    '/:id',
    {
      schema: Schemas.FindById
    },
    async function findById(
      request: FastifyRequest<{ Params: Schemas.IFindByIdParams }>,
      reply: FastifyReply,
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
      schema: Schemas.Create
    },
    async function create(
      request: FastifyRequest<{ Body: Schemas.ICreateBody }>,
      reply: FastifyReply
    ) {
      const leaguesService = Container.get(LeaguesService);
      const user = await leaguesService.create({
        name: request.body.name,
        ownerId: request.body.ownerId
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
      const leaguesService = Container.get(LeaguesService);
      await leaguesService.delete(request.params.id);

      reply.code(200).send('ok');
    }
  );
}