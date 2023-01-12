import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import * as Schemas from './schemas';
import Container from "typedi";
import { UserService } from "../../services/users";
import sleep from "../../utils/sleep";
import { NotFoundError, UnauthorizedError } from "../../lib/errors/errors";
import { randomBytes } from "crypto";

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

      const token = await reply.jwtSign({ 'user': user.id });
      const refreshToken = await reply.jwtSign({
        token: randomBytes(64).toString('hex')
      }, { expiresIn: '30s' });
      
      reply
        .setCookie('refreshToken', refreshToken)
        .send({ token })
    }
  );

  // fastify.post(
  //   '/refresh',
  //   {
  //     schema: Schemas.Refresh
  //   },
  //   async function refresh(
  //     request: FastifyRequest<{ Body: Schemas.IRefresh }>,
  //     reply: FastifyReply
  //   ) {
  //     const usersService = Container.get(UserService);
  //     const user = await usersService.findOne(null, {
  //       refreshToken: request.body.refreshToken
  //     });

  //     if (!user) {
  //       await sleep(2000);
  //       return reply.send(new UnauthorizedError());
  //     }

  //     const token = fastify.jwt.sign({ 'user': user.id});
  //     reply.send({ token });
  //   }
  // );

  // fastify.post(
  //   '/logout',
  //   {
  //     schema: Schemas.Logout
  //   },
  //   async function logout(
  //     request: FastifyRequest<{ Body: Schemas.ILogout }>,
  //     reply: FastifyReply
  //   ) {
  //     const usersService = Container.get(UserService);
  //     const user = await usersService.findOne(null, {
  //       refreshToken: request.body.refreshToken
  //     });

  //     if (!user) {
  //       await sleep(2000);
  //       return reply.send(new UnauthorizedError());
  //     }

  //     user.refreshToken = null;
  //     await user.save();
  //   }
  // )
}