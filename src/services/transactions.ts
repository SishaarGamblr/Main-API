import Container, { Service } from 'typedi';
import { Transaction } from '../entities/Transaction';
import { EntityNotFoundError, FindOneOptions } from 'typeorm';
import connection from '../utils/database/connection';
import { Wallet } from '../entities/Wallet';
import { InsufficientBalanceError, NotFoundError } from '../lib/errors/errors';

@Service()
export class TransactionsService {
  async findOne(id: string, params?: FindOneDTO) {
    const options: FindOneOptions<Transaction> = {
      where: {
        id,
        deleted: params?.deleted ? params.deleted : false,
      },
    };

    return await Transaction.findOne(options);
  }

  async findOneOrFail(id: string, params?: FindOneDTO) {
    const options: FindOneOptions<Transaction> = {
      where: {
        id,
        deleted: params?.deleted ? params.deleted : false,
      },
    };

    return await Transaction.findOneOrFail(options).catch((err) => {
      if (err instanceof EntityNotFoundError) {
        throw new NotFoundError('Transaction');
      }
      throw err;
    });
  }

  TRANSACTION = {
    async create(params: CreateTransactionDTO): Promise<Transaction> {
      let transaction: Transaction;

      return await connection
        .transaction(async (trx) => {
          // Acquire lock on both wallets via `SELECT FOR UPDATE...`
          const [from, to] = await Promise.all([
            trx.findOneOrFail(Wallet, {
              where: { id: params.fromId },
              lock: { mode: 'pessimistic_write' },
            }),
            trx.findOneOrFail(Wallet, {
              where: { id: params.toId },
              lock: { mode: 'pessimistic_write' },
            }),
          ]);

          // Verify balance in From Wallet
          if (from.balance < params.amount) {
            throw new InsufficientBalanceError();
          }

          // Create transaction record
          transaction = Transaction.create({
            amount: params.amount,
            from: { id: params.fromId },
            to: { id: params.toId },
          });

          // Deduct/Add amount to wallet balances, save transaction
          await Promise.all([
            trx.update(Wallet, from.id, {
              balance: Number(from.balance - params.amount),
            }),
            trx.update(Wallet, to.id, {
              balance: Number(to.balance + params.amount),
            }),
            trx.save(transaction),
          ]);
          // COMMIT
        })
        .then(async () => {
          return Container.get(TransactionsService).findOneOrFail(
            transaction.id
          );
        });
    },
  };
}

interface FindOneDTO {
  deleted?: boolean;
}

interface CreateTransactionDTO {
  amount: number;
  fromId: string;
  toId: string;
}
