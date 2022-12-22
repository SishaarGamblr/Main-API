import Container from 'typedi';
import { Wallet } from '../../../entities/Wallet';
import { Transaction } from '../../../entities/Transaction';
import { TransactionsService } from '../../../services/transactions';
import server from '../../../app';
import { Response } from 'light-my-request';

describe('Transactions Controller', () => {
  afterEach(() => {
    Container.reset();
  });

  describe('POST /transactions', () => {
    describe('successfully creating a transaction', () => {
      let fromWallet: Wallet;
      let toWallet: Wallet;
      let transaction: Transaction;
      let response: Response;

      const AMOUNT = 100;

      beforeAll(async () => {
        fromWallet = await Wallet.create({ balance: AMOUNT }).save();
        toWallet = await Wallet.create().save();
        transaction = await Transaction.create({
          amount: AMOUNT,
          from: { id: fromWallet.id },
          to: { id: toWallet.id },
        }).save();
      });

      beforeAll(async () => {
        const mockTransactionService = {
          TRANSACTION: {
            create: () => Promise.resolve(transaction),
          },
        };
        Container.set(TransactionsService, mockTransactionService);
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
        response = await server.inject({
          method: 'POST',
          url: '/transactions',
          payload: {
            amount: AMOUNT,
            fromId: fromWallet.id,
            toId: toWallet.id,
          },
        });

        expect(response.statusCode).toBe(200);
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
        const responseJson = response.json();
        expect(responseJson.id).toBe(transaction.id);
        expect(responseJson.amount).toBe(AMOUNT);
        expect(responseJson.fromId).toBe(fromWallet.id);
        expect(responseJson.toId).toBe(toWallet.id);
      });
    });

    describe('trying to create a transaction for a wallet with insufficient balance', () => {
      let fromWallet: Wallet;
      let toWallet: Wallet;
      let response: Response;

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
        response = await server.inject({
          method: 'POST',
          url: '/transactions',
          payload: {
            amount: AMOUNT * 2,
            fromId: fromWallet.id,
            toId: toWallet.id,
          },
        });

        expect(response.statusCode).toBe(403);
        expect(JSON.parse(response.body).code).toBe(
          'INSUFFICENT_WALLET_BALANCE'
        );
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
      let transaction: Transaction;

      const AMOUNT = 100;

      beforeAll(async () => {
        fromWallet = await Wallet.create({ balance: AMOUNT * 3 }).save();
        toWallet = await Wallet.create().save();
        transaction = await Transaction.create({
          amount: AMOUNT,
          from: { id: fromWallet.id },
          to: { id: toWallet.id },
        }).save();
      });

      beforeAll(async () => {
        const mockTransactionService = {
          TRANSACTION: {
            create: () => Promise.resolve(transaction),
          },
        };
        Container.set(TransactionsService, mockTransactionService);
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
        const [response_1, response_2, response_3] = await Promise.all([
          server.inject({
            method: 'POST',
            url: '/transactions',
            payload: {
              amount: AMOUNT,
              fromId: fromWallet.id,
              toId: toWallet.id,
            },
          }),
          server.inject({
            method: 'POST',
            url: '/transactions',
            payload: {
              amount: AMOUNT,
              fromId: fromWallet.id,
              toId: toWallet.id,
            },
          }),
          server.inject({
            method: 'POST',
            url: '/transactions',
            payload: {
              amount: AMOUNT,
              fromId: fromWallet.id,
              toId: toWallet.id,
            },
          }),
        ]);

        expect(response_1.statusCode).toBe(200);
        expect(response_2.statusCode).toBe(200);
        expect(response_3.statusCode).toBe(200);
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

  describe('GET /transactions/:id', () => {
    describe('fetching a transaction', () => {
      let transaction: Transaction;

      beforeAll(async () => {
        let wallet = Wallet.create();
        transaction = Transaction.create({
          id: 'dummy',
          from: { id: wallet.id },
          to: { id: wallet.id },
        });
      });

      beforeAll(async () => {
        const mockTransactionService = {
          findOne: () => Promise.resolve(transaction),
        };
        Container.set(TransactionsService, mockTransactionService);
      });

      it('fetches the transaction', async () => {
        const response = await server.inject({
          method: 'GET',
          url: `/transactions/${transaction.id}`,
        });

        expect(response.statusCode).toBe(200);
        expect(response.json().id).toBe(transaction.id);
      });
    });

    describe("fetching a transaction which doesn't exist", () => {
      beforeAll(async () => {
        const mockTransactionService = {
          findOne: () => Promise.resolve(null),
        };
        Container.set(TransactionsService, mockTransactionService);
      });

      it('fetches the transaction', async () => {
        const response = await server.inject({
          method: 'GET',
          url: `/transactions/dummy`,
        });

        expect(response.statusCode).toBe(404);
        expect(response.json().code).toBe('NOT_FOUND');
      });
    });
  });
});
