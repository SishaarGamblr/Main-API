import Container from 'typedi';
import { Wallet } from '../../../entities/Wallet';
import { Transaction } from '../../../entities/Transaction';
import { TransactionsService } from '../../../services/transactions';
import server from '../../../app';
import { Response } from 'light-my-request';
import { WalletsService } from '../../../services/wallets';

describe('Transactions Controller', () => {
  afterEach(() => {
    Container.reset();
  });

  describe('POST /transactions', () => {
    describe('creating a transaction', () => {
      let wallet: Wallet;
      let transaction: Transaction;
      let response: Response;

      beforeAll(async () => {
        wallet = await Wallet.create({
          owner: { id: 'dummyUserId' },
        }).save();
        transaction = await Transaction.create({
          amount: 100,
          from: { id: wallet.id },
          to: { id: wallet.id },
        }).save();
      });

      let mockTransactionService;
      let mockWalletsService: { findOneOrFail: any };

      beforeAll(() => {
        mockTransactionService = {
          TRANSACTION: {
            create: jest.fn().mockResolvedValue(transaction),
          },
        };

        mockWalletsService = {
          findOneOrFail: jest.fn().mockResolvedValue(wallet),
        };

        Container.set(WalletsService, mockWalletsService);
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
            amount: 100,
            fromId: wallet.id,
            toId: wallet.id,
          },
          headers: {
            authorization: 'Bearer test',
          },
        });
        expect(response.statusCode).toBe(200);
      });

      it('sets payload properties on the transaction', async () => {
        const responseJson = response.json();
        expect(responseJson.id).toBe(transaction.id);
        expect(responseJson.amount).toBe(transaction.amount);
        expect(responseJson.fromId).toBe(transaction.fromId);
        expect(responseJson.toId).toBe(transaction.toId);
      });

      it('uses a wallet that belongs to the user making the request', async () => {
        expect(mockWalletsService.findOneOrFail).toHaveBeenCalledWith(
          undefined,
          { ownerId: 'dummyUserId' }
        );
      });
    });

    describe('creating a transaction with a negative amount', () => {
      it('throws an error', async () => {
        const response = await server.inject({
          method: 'POST',
          url: '/transactions',
          payload: {
            amount: -100,
            toId: 'dummy',
          },
          headers: {
            authorization: 'Bearer test',
          },
        });

        expect(response.statusCode).toBe(400);
        expect(response.json()).toMatchInlineSnapshot(`
          {
            "error": "Bad Request",
            "message": "body/amount must be >= 0",
            "statusCode": 400,
          }
        `);
      });
    });

    describe('creating a transaction that fails', () => {
      let wallet: Wallet;
      let response: Response;

      beforeAll(async () => {
        wallet = await Wallet.create().save();
      });

      beforeAll(() => {
        const mockTransactionService = {
          TRANSACTION: {
            create: () => Promise.reject(new Error('dummy')),
          },
        };
        const mockWalletsService = {
          findOneOrFail: () => jest.fn().mockResolvedValue(wallet),
        };

        Container.set(WalletsService, mockWalletsService);
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

      it('throws an error', async () => {
        response = await server.inject({
          method: 'POST',
          url: '/transactions',
          payload: {
            amount: 100,
            fromId: wallet.id,
            toId: wallet.id,
          },
          headers: {
            authorization: 'Bearer test',
          },
        });

        expect(response.statusCode).toBe(500);
        expect(response.body).toMatchInlineSnapshot(
          `"{"statusCode":500,"error":"Internal Server Error","message":"dummy"}"`
        );
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
