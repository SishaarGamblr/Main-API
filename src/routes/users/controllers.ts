import { FastifyRequest, FastifyReply } from "fastify";
import Container from "typedi";
import { NotFoundError } from "../../lib/errors/errors";
import { UserService } from "../../services/users";
import * as Schemas from './schemas';

export async function findById(
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

export async function create(
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

export async function deleteUser(
  request: FastifyRequest<{ Params: Schemas.IDeleteParams }>,
  reply: FastifyReply
) {
  const usersService = Container.get(UserService);
  await usersService.delete(request.params.id);

  reply.code(200).send('ok');
}