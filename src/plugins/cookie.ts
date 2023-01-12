import fp from 'fastify-plugin';
import Config from 'config';
import Cookies from '@fastify/cookie'

import { FastifyError, FastifyInstance, FastifyPluginOptions } from 'fastify';

export default fp((fastify: FastifyInstance, _options: FastifyPluginOptions, done: (error?: FastifyError) => void): void => {
  fastify.register(Cookies, {
    secret: Config.get<string>('security.Cookie_secret')
  });

  done();
})

