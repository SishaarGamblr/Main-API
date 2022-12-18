import { FastifyInstance } from 'fastify';

import users from './controllers/users';

export default async function router(fastify: FastifyInstance) {
  fastify.register(users, { prefix: '/users' });
}
