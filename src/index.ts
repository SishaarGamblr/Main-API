import 'reflect-metadata'; // NOTE: MUST BE FIRST IMPORT

import app from './app';
import connection from './utils/database/connection';

const FASTIFY_PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

async function shutdown(code = 0) {
  if (connection.isInitialized) {
    await connection.destroy();
  }
  app.log.info('Shutting down');
  await app.close();
  app.log.info('Server has shut down');
  process.exit(code);
}

async function init() {
  if (!connection.isInitialized) {
    await connection.initialize();
  }

  try {
    app.listen({
      port: FASTIFY_PORT,
      host: '0.0.0.0',
    });
  } catch (err) {
    app.log.error(err);
    shutdown(1);
  }

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  console.log(`🚀  Fastify server running on port ${FASTIFY_PORT}`);
}

void init();
