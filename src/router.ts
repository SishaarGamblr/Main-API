import { FastifyInstance } from 'fastify';

import users from './controllers/user';

export default async function router(fastify: FastifyInstance) {
  fastify.register(users, { prefix: '/users' });
}
