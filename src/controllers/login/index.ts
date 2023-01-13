import { FastifyInstance } from "fastify";
import * as Schemas from './schemas';
import * as Controllers from './controllers';

export default async (fastify: FastifyInstance) => {
  fastify.post(
    '/login',
    {
      schema:  Schemas.Login
    },
    Controllers.login
  );

  fastify.post(
    '/verify',
    {
      schema: Schemas.Verify,
      onRequest: [fastify.authenticate]
    },
    Controllers.verify
  )

  fastify.post(
    '/refresh',
    {
      schema: Schemas.Refresh
    },
    Controllers.refresh
  );

  fastify.post(
    '/logout',
    {
      schema: Schemas.Logout,
      onRequest: [fastify.authenticate]
    },
    Controllers.logout
  )
}