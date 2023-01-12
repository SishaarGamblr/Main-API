import fastify from 'fastify';
import router from './router';
import autoLoad from '@fastify/autoload';
import { dirname, join } from 'path';

const server = fastify({
  // Logger only for production
  logger: !['development', 'test', 'ci'].includes(String(process.env.NODE_ENV)),
});

// Middleware: Router
server.register(router);

// Autoload plugins
server.register(autoLoad, {
  dir: join(dirname(__filename), 'plugins')
});

export default server;
