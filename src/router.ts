import { FastifyInstance } from 'fastify';

import users from './controllers/users';
import leagues from './controllers/leagues';
import transactions from './controllers/transactions';

export default async function router(fastify: FastifyInstance) {
  fastify.register(users, { prefix: '/users' });
  fastify.register(leagues, { prefix: '/leagues' });
  fastify.register(transactions, { prefix: '/transactions' });
}
