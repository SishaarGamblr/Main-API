import { FastifyRequest, FastifyReply } from "fastify";
import Container from "typedi";
import { NotFoundError } from "../../lib/errors/errors";
import { LeaguesService } from "../../services/leagues";
import * as Schemas from './schemas';

export async function findById(
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

export async function create(
  request: FastifyRequest<{ Body: Schemas.ICreateBody }>,
  reply: FastifyReply
) {
  const leaguesService = Container.get(LeaguesService);
  const league = await leaguesService.create({
    name: request.body.name,
    ownerId: request.body.ownerId,
  });

  reply.send(league);
}

export async function deleteLeague(
  request: FastifyRequest<{ Params: Schemas.IDeleteParams }>,
  reply: FastifyReply
) {
  const leaguesService = Container.get(LeaguesService);
  await leaguesService.delete(request.params.id);

  reply.code(200).send('ok');
}

export async function inviteUser(
  request: FastifyRequest<{ Params: Schemas.IInviteUserParams}>,
  reply: FastifyReply
) {
  const leaguesService = Container.get(LeaguesService);
  // TODO: Add invitedById based on JWT
  await leaguesService.inviteUser(request.params.id, request.params.userId);

  reply.code(200).send('ok');
}