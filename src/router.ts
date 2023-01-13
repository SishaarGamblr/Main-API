import { FastifyInstance } from 'fastify';

import users from './routes/users';
import leagues from './routes/leagues';
import transactions from './routes/transactions';
import login from './routes/login';
import cookie from './plugins/cookie';
import jwt from './plugins/jwt';

export default async function router(fastify: FastifyInstance) {
  fastify.register(cookie);
  fastify.register(jwt);

  fastify.register(login);
  fastify.register(users, { prefix: '/users' });
  fastify.register(leagues, { prefix: '/leagues' });
  fastify.register(transactions, { prefix: '/transactions' });
}
