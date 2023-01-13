import fastify from 'fastify';
import router from './router';

const server = fastify({
  // Logger only for production
  logger: !['development', 'test', 'ci'].includes(String(process.env.NODE_ENV)),
  connectionTimeout: 10000
});

// Middleware: Router
server.register(router);

export default server;
