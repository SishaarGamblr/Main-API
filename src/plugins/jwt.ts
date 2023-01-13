import fp from 'fastify-plugin';
import Config from 'config';
import JWT from '@fastify/jwt'

import { FastifyError, FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export default fp((fastify: FastifyInstance, _options: FastifyPluginOptions, done: (error?: FastifyError) => void): void => {
  fastify.register(JWT, {
    secret: Config.get<string>('security.JWT_secret'),
    cookie: {
      cookieName: 'refreshToken',
      signed: false
    },
    sign: {
      expiresIn: '90d'
    }
  });

  fastify.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply) {
    if (['development', 'test'].includes(String(process.env.NODE_ENV)) && request.headers.authorization === 'Bearer test') {
      return;
    }

    try {
      await request.jwtVerify()
    } catch (err) {
      reply.send(err);
    }
  });

  done();
})

