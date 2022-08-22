import { FastifyInstance } from "fastify";

import users from './controller/user';

export default async function router(fastify: FastifyInstance) {
  fastify.register(users, { prefix: '/users'})
}
