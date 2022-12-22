import { Service } from "typedi";
import { Transaction } from "../entities/Transaction";
import { EntityManager, FindOneOptions } from "typeorm";

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

  TRANSACTION = {
    async create(tx: EntityManager, options: CreateTransactionDTO) {
      const transaction = Transaction.create({
        amount: options.amount,
        from: { id: options.fromId },
        to: { id: options.toId }
      });

      return await tx.save(transaction);
    },

  }
}

interface FindOneDTO {
  deleted?: boolean;
}

interface CreateTransactionDTO {
  amount: number;
  fromId: string;
  toId: string;
}