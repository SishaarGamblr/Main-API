import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import * as Schemas from './schemas';
import Container from "typedi";
import { UserService } from "../../services/users";
import sleep from "../../utils/sleep";
import { NotFoundError, UnauthorizedError, UnexpectedErorr } from "../../lib/errors/errors";

export default async (fastify: FastifyInstance) => {
  fastify.post(
    '/login',
    {
      schema:  Schemas.Login
    },
    async function login(
      request: FastifyRequest<{ Body: Schemas.ILogin }>,
      reply: FastifyReply
    ) {
      const usersService = Container.get(UserService);
      const user = await usersService.findOne(null, {
        phone: request.body.phone
      });

      if (!user) {
        await sleep(2000);
        return reply.send(new NotFoundError('user'));
      }

      if ((await usersService.checkPassword(user.id, request.body.password)) === false) {
        await sleep(2000);
        return reply.send(new UnauthorizedError());
      }

      const token = await reply.jwtSign({ userId: user.id }, { expiresIn: '1d' });
      const refreshToken = await reply.jwtSign({
        user: user.id,
      }, { expiresIn: '90d' });
      
      reply
        .setCookie('refreshToken', refreshToken)
        .send({ token })
    }
  );

  fastify.post(
    '/verify',
    {
      schema: Schemas.Verify,
      onRequest: [fastify.authenticate]
    },
    async function verify(
      _request: FastifyRequest,
      reply: FastifyReply
    ) {
      reply.send('ok');
    }
  )

  fastify.post(
    '/refresh',
    {
      schema: Schemas.Refresh
    },
    async function refresh(
      request: FastifyRequest,
      reply: FastifyReply
    ) {
      const decoded: { userId: string } = await request.jwtVerify({ onlyCookie: true });
      
      const usersService = Container.get(UserService);
      const user = await usersService.findOne(decoded.userId);

      if (!user) {
        await sleep(2000);
        return reply.send(new UnauthorizedError());
      }

      const token = await reply.jwtSign({ userId: user.id }, { expiresIn: '1d' });
      
      reply.send({ token });
    }
  );

  fastify.post(
    '/logout',
    {
      schema: Schemas.Logout,
      onRequest: [fastify.authenticate]
    },
    async function logout(
      request: FastifyRequest,
      reply: FastifyReply
    ) {
      const usersService = Container.get(UserService);
      const user = await usersService.findOne((request.user as Schemas.IAuth).user);

      if (!user) {
        await sleep(2000);
        return reply.send(new UnauthorizedError());
      }

      try {
        return reply
          .clearCookie('refreshToken')
          .status(200)
          .send();
      } catch (err) {
        reply.send(new UnexpectedErorr())
      }
    }
  )
}