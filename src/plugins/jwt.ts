import fp from 'fastify-plugin';
import Config from 'config';
import JWT from '@fastify/jwt'

import { FastifyError, FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest } from 'fastify';

fp((fastify: FastifyInstance, _options: FastifyPluginOptions, next: (error?: FastifyError) => void): void => {
  fastify.register(JWT, {
    secret: Config.get<string>('security.JWT_secret')
  });

  fastify.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.send(err);
    }
  });

  next();
})

