import { FastifyInstance } from 'fastify';

import users from './controllers/users';
import leagues from './controllers/leagues';

export default async function router(fastify: FastifyInstance) {
  fastify.register(users, { prefix: '/users' });
  fastify.register(leagues, { prefix: '/leagues' });
}
