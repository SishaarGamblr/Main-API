import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import * as Schemas from './schemas';
import Container from 'typedi';
import { NotFoundError } from '../../lib/errors/errors';
import { TransactionsService } from '../../services/transactions';

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

      try {
        const transaction = await transactionsService.TRANSACTION.create({
          amount: request.body.amount,
          fromId: request.body.fromId,
          toId: request.body.toId,
        });

        reply.status(200).send(transaction);
      } catch (err) {
        reply.send(err);
      }
    }
  );
};
