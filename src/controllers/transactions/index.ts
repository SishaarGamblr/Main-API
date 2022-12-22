import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import * as Schemas from './schemas';
import Container from 'typedi';
import {
  InsufficientBalanceError,
  NotFoundError,
} from '../../lib/errors/errors';
import { TransactionsService } from '../../services/transactions';
import connection from '../../utils/database/connection';
import { Wallet } from '../../entities/Wallet';
import { Transaction } from '../../entities/Transaction';

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
    },
    async function create(
      request: FastifyRequest<{ Body: Schemas.ICreateBody }>,
      reply: FastifyReply
    ) {
      const transactionsService = Container.get(TransactionsService);

      let transaction: Transaction;

      await connection
        .transaction(async (tx) => {
          // Acquire lock on both wallets via `SELECT FOR UPDATE...`
          const [from, to] = await Promise.all([
            tx.findOneOrFail(Wallet, {
              where: { id: request.body.fromId },
              lock: { mode: 'pessimistic_write' },
            }),
            tx.findOneOrFail(Wallet, {
              where: { id: request.body.toId },
              lock: { mode: 'pessimistic_write' },
            }),
          ]);

          // Verify balance in From Wallet
          if (from.balance < request.body.amount) {
            throw new InsufficientBalanceError();
          }

          // Deduct/Add amount to wallet balances
          await Promise.all([
            tx.update(Wallet, from.id, {
              balance: Number(from.balance - request.body.amount),
            }),
            tx.update(Wallet, to.id, {
              balance: Number(to.balance + request.body.amount),
            }),
          ]);

          // Create transaction record
          transaction = await transactionsService.TRANSACTION.create(tx, {
            amount: request.body.amount,
            fromId: request.body.fromId,
            toId: request.body.toId,
          });
          // COMMIT
        })
        .catch((err) => {
          reply.send(err);
        })
        .then(() => {
          reply.status(200).send(transaction);
        });
    }
  );
};
