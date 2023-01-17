import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import * as Schemas from './schemas';
import Container from 'typedi';
import { NotFoundError } from '../../lib/errors/errors';
import { TransactionsService } from '../../services/transactions';
import { IAuth } from '../login/schemas';
import { WalletsService } from '../../services/wallets';
import { Wallet } from '../../entities/Wallet';

export default async (fastify: FastifyInstance) => {
  fastify.get(
    '/:id',
    {
      schema: Schemas.FindById,
    },
    async function findById(
      request: FastifyRequest<{ Params: Schemas.IFindByIdParams }>,
      reply: FastifyReply
    ) {
      const transactionsService = Container.get(TransactionsService);
      const transaction = await transactionsService.findOne(request.params.id);

      if (!transaction) {
        reply.send(new NotFoundError('Transaction'));
      }

      reply.send(transaction);
    }
  );

  fastify.post(
    '/',
    {
      schema: Schemas.Create,
      preHandler: [fastify.authenticate]
    },
    async function create(
      request: FastifyRequest,
      reply: FastifyReply
    ) {
      const body = request.body as Schemas.ICreateBody;
      const { userId } = request.user as IAuth;

      const transactionsService = Container.get(TransactionsService);
      const walletsService = Container.get(WalletsService);

      const fromWallet: Wallet = await walletsService.findOneOrFail(undefined, { ownerId: userId });

      try {
        const transaction = await transactionsService.TRANSACTION.create({
          amount: body.amount,
          fromId: fromWallet.id,
          toId: body.toId,
        });

        reply.status(200).send(transaction);
      } catch (err) {
        reply.send(err);
      }
    }
  );
};
