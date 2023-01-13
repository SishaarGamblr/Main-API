import fp from 'fastify-plugin';
import Config from 'config';
import cookie from '@fastify/cookie'

import { FastifyError, FastifyInstance, FastifyPluginOptions } from 'fastify';

export default fp((fastify: FastifyInstance, _options: FastifyPluginOptions, done: (error?: FastifyError) => void): void => {
  fastify.register(cookie, {
    secret: Config.get<string>('security.Cookie_secret'),
    parseOptions: {}
  });

  done();
})
