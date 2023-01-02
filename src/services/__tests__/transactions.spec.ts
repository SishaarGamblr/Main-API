import Container from 'typedi';
import { TransactionsService } from '../transactions';
import { Transaction } from '../../entities/Transaction';
import { Wallet } from '../../entities/Wallet';
import { InsufficientBalanceError, NotFoundError } from '../../lib/errors/errors';

describe('Transactions Service', () => {
  const transactionsService = Container.get(TransactionsService);

  describe('findOne', () => {
    describe('finding an existing transaction', () => {
      let transaction: Transaction;

      beforeAll(async () => {
        const wallet = await Wallet.create().save();
        transaction = await Transaction.create({
          amount: 1,
          from: { id: wallet.id },
          to: { id: wallet.id },
        }).save();
      });

      afterAll(async () => {
        const [wallets, transactions] = await Promise.all([
          Wallet.find(),
          Transaction.find(),
        ]);

        await Transaction.remove(transactions);
        await Wallet.remove(wallets);
      });

      it('returns the transaction', async () => {
        const response = await transactionsService.findOne(transaction.id);

        expect(response).toBeDefined();
        expect(response?.id).toBe(transaction.id);
      });
    });

    describe('finding a deleted transaction', () => {
      let transaction: Transaction;

      beforeAll(async () => {
        const wallet = await Wallet.create().save();
        transaction = await Transaction.create({
          amount: 1,
          from: { id: wallet.id },
          to: { id: wallet.id },
          deleted: true,
        }).save();
      });

      afterAll(async () => {
        const [wallets, transactions] = await Promise.all([
          Wallet.find(),
          Transaction.find(),
        ]);

        await Transaction.remove(transactions);
        await Wallet.remove(wallets);
      });

      it('returns the transaction with the `deleted` parameter', async () => {
        const response = await transactionsService.findOne(transaction.id, {
          deleted: true,
        });

        expect(response).toBeDefined();
        expect(response?.id).toBe(transaction.id);
      });

      it('does not return the transaction without the `deleted` parameter', async () => {
        const response = await transactionsService.findOne(transaction.id);
        expect(response).toBeNull();
      });
    });

    describe('finding a non-existant transaction', () => {
      it('returns null', async () => {
        const response = await transactionsService.findOne('dummy');
        expect(response).toBeNull();
      });
    });
  });

  describe('findOneOrFail', () => {
    describe('finding an existing transaction', () => {
      let transaction: Transaction;

      beforeAll(async () => {
        const wallet = await Wallet.create().save();
        transaction = await Transaction.create({
          amount: 1,
          from: { id: wallet.id },
          to: { id: wallet.id },
        }).save();
      });

      afterAll(async () => {
        const [wallets, transactions] = await Promise.all([
          Wallet.find(),
          Transaction.find(),
        ]);

        await Transaction.remove(transactions);
        await Wallet.remove(wallets);
      });

      it('returns the transaction', async () => {
        const response = await transactionsService.findOneOrFail(transaction.id);

        expect(response).toBeDefined();
        expect(response?.id).toBe(transaction.id);
      });
    });

    describe('finding a deleted transaction', () => {
      let transaction: Transaction;

      beforeAll(async () => {
        const wallet = await Wallet.create().save();
        transaction = await Transaction.create({
          amount: 1,
          from: { id: wallet.id },
          to: { id: wallet.id },
          deleted: true,
        }).save();
      });

      afterAll(async () => {
        const [wallets, transactions] = await Promise.all([
          Wallet.find(),
          Transaction.find(),
        ]);

        await Transaction.remove(transactions);
        await Wallet.remove(wallets);
      });

      it('returns the transaction with the `deleted` parameter', async () => {
        const response = await transactionsService.findOneOrFail(transaction.id, {
          deleted: true,
        });

        expect(response).toBeDefined();
        expect(response?.id).toBe(transaction.id);
      });

      it('throws an error without the `deleted` parameter', async () => {
        let response: Transaction | undefined;
        let caughtErr;
        try {
          response = await transactionsService.findOneOrFail(transaction.id);
        } catch (err) {
          caughtErr = err;
        }

        expect(response).toBeUndefined();
        expect(caughtErr).toBeDefined();
        expect(caughtErr).toBeInstanceOf(NotFoundError);
      });
    });

    describe('finding a non-existent transaction', () => {
      it('throws an error', async () => {
        const response = await transactionsService.findOneOrFail('dummy').catch(err => err);
        expect(response).toBeInstanceOf(NotFoundError);
      });
    });
  });
  

  describe('TRANSACTION', () => {
    describe('create', () => {
      describe('successfully creating a transaction', () => {
        let fromWallet: Wallet;
        let toWallet: Wallet;
        let transaction: Transaction;

        const AMOUNT = 100;

        beforeAll(async () => {
          fromWallet = await Wallet.create({ balance: AMOUNT }).save();
          toWallet = await Wallet.create().save();
        });

        afterAll(async () => {
          const [wallets, transactions] = await Promise.all([
            Wallet.find(),
            Transaction.find(),
          ]);

          await Transaction.remove(transactions);
          await Wallet.remove(wallets);
        });

        it('does not throw an error', async () => {
          let caughtErr;
          try {
            transaction = await transactionsService.TRANSACTION.create({
              amount: AMOUNT,
              fromId: fromWallet.id,
              toId: toWallet.id,
            });
          } catch (err) {
            caughtErr = err;
          }

          expect(transaction).toBeDefined();
          expect(caughtErr).toBeUndefined();
        });

        it('deducts the amount from the origin wallet', async () => {
          await fromWallet.reload();
          expect(fromWallet.balance).toBe(0);
        });

        it('adds the amount to the recipient wallet', async () => {
          await toWallet.reload();
          expect(toWallet.balance).toBe(AMOUNT);
        });

        it('creates a transaction object', async () => {
          expect(transaction.amount).toBe(AMOUNT);
          expect(transaction.fromId).toBe(fromWallet.id);
          expect(transaction.toId).toBe(toWallet.id);
        });
      });

      describe('trying to create a transaction for a wallet with insufficient balance', () => {
        let fromWallet: Wallet;
        let toWallet: Wallet;
        let transaction: Transaction;

        const AMOUNT = 50;

        beforeAll(async () => {
          fromWallet = await Wallet.create({ balance: AMOUNT }).save();
          toWallet = await Wallet.create().save();
        });

        afterAll(async () => {
          const [wallets, transactions] = await Promise.all([
            Wallet.find(),
            Transaction.find(),
          ]);

          await Transaction.remove(transactions);
          await Wallet.remove(wallets);
        });

        it('throws an error', async () => {
          let caughtErr;
          try {
            transaction = await transactionsService.TRANSACTION.create({
              amount: AMOUNT * 2,
              fromId: fromWallet.id,
              toId: toWallet.id,
            });
          } catch (err) {
            caughtErr = err;
          }

          expect(transaction).toBeUndefined();
          expect(caughtErr).toBeDefined();
          expect(caughtErr).toBeInstanceOf(InsufficientBalanceError);
        });

        it('does not deduct the amount from the origin wallet', async () => {
          await fromWallet.reload();
          expect(fromWallet.balance).toBe(AMOUNT);
        });

        it('does not add the amount to the recipient wallet', async () => {
          await toWallet.reload();
          expect(toWallet.balance).toBe(0);
        });

        it('does not create a transaction', async () => {
          const transactions = await Transaction.find();
          expect(transactions.length).toBe(0);
        });
      });

      describe('creating many transactions in parallel', () => {
        let fromWallet: Wallet;
        let toWallet: Wallet;

        const AMOUNT = 100;

        beforeAll(async () => {
          fromWallet = await Wallet.create({ balance: AMOUNT * 3 }).save();
          toWallet = await Wallet.create().save();
        });

        afterAll(async () => {
          const [wallets, transactions] = await Promise.all([
            Wallet.find(),
            Transaction.find(),
          ]);

          await Transaction.remove(transactions);
          await Wallet.remove(wallets);
        });

        it('does not throw an error', async () => {
          let caughtErr;
          let response_1, response_2, response_3;
          try {
            [response_1, response_2, response_3] = await Promise.all([
              transactionsService.TRANSACTION.create({
                amount: AMOUNT,
                fromId: fromWallet.id,
                toId: toWallet.id,
              }),
              transactionsService.TRANSACTION.create({
                amount: AMOUNT,
                fromId: fromWallet.id,
                toId: toWallet.id,
              }),
              transactionsService.TRANSACTION.create({
                amount: AMOUNT,
                fromId: fromWallet.id,
                toId: toWallet.id,
              }),
            ]);
          } catch (err) {
            caughtErr = err;
          }

          expect(caughtErr).toBeUndefined();

          expect(response_1).toBeDefined();
          expect(response_2).toBeDefined();
          expect(response_3).toBeDefined();
        });

        it('deducts the total amount from the origin wallet', async () => {
          await fromWallet.reload();
          expect(fromWallet.balance).toBe(0);
        });

        it('adds the total amount to the recipient wallet', async () => {
          await toWallet.reload();
          expect(toWallet.balance).toBe(AMOUNT * 3);
        });
      });
    });
  });
});
