import { FastifyRequest, FastifyReply } from "fastify";
import Container from "typedi";
import { NotFoundError, UnauthorizedError, UnexpectedErorr } from "../../lib/errors/errors";
import { UserService } from "../../services/users";
import sleep from "../../utils/sleep";
import * as Schemas from './schemas';


export async function login(
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

  const token = await reply.jwtSign({ user: user.id }, { expiresIn: '1d' });
  const refreshToken = await reply.jwtSign({
    user: user.id,
  }, { expiresIn: '90d' });
  
  reply
    .setCookie('refreshToken', refreshToken)
    .send({ token })
}

export async function verify(
  _request: FastifyRequest,
  reply: FastifyReply
) {
  reply.send('ok');
}

export async function refresh(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const decoded: { user: string } = await request.jwtVerify({ onlyCookie: true });
  
  const usersService = Container.get(UserService);
  const user = await usersService.findOne(decoded.user);

  if (!user) {
    await sleep(2000);
    return reply.send(new UnauthorizedError());
  }

  const token = await reply.jwtSign({ user: user.id }, { expiresIn: '1d' });
  
  reply.send({ token });
}

export async function logout(
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