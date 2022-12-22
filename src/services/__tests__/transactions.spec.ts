import Container from "typedi";
import { TransactionsService } from "../transactions";
import { Transaction } from "../../entities/Transaction";
import { Wallet } from "../../entities/Wallet";
import connection from "../../utils/database/connection";

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
          to: { id: wallet.id }
        }).save();
      });

      afterAll(async () => {
        const [wallets, transactions] = await Promise.all([
          Wallet.find(),
          Transaction.find()
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
          deleted: true
        }).save();
      });

      afterAll(async () => {
        const [wallets, transactions] = await Promise.all([
          Wallet.find(),
          Transaction.find()
        ]);

        await Transaction.remove(transactions);
        await Wallet.remove(wallets);
      });

      it('returns the transaction with the `deleted` parameter', async () => {
        const response = await transactionsService.findOne(transaction.id, {
          deleted: true
        });

        expect(response).toBeDefined();
        expect(response?.id).toBe(transaction.id);
      });

      it('does not return the transaction without the `deleted` parameter', async () => {
        const response = await transactionsService.findOne(transaction.id);
        expect(response).toBeNull();
      })
    });

    describe('finding a non-existant transaction', () => {
      it('returns null', async () => {
        const response = await transactionsService.findOne('dummy');
        expect(response).toBeNull();
      });
    });

  });

  describe('TRANSACTION', () => {

    describe('create', () => {

      describe('creating a transaction', () => {
        let wallet: Wallet;
        let transaction: Transaction;

        beforeAll(async () => {
          wallet = await Wallet.create().save();
        })
        
        afterAll(async () => {
          const [wallets, transactions] = await Promise.all([
            Wallet.find(),
            Transaction.find()
          ]);
  
          await Transaction.remove(transactions);
          await Wallet.remove(wallets);
        });

        it('does not throw an error', async () => {
          let caughtErr;
          await connection.transaction(async (tx) => {
            try {
              transaction = await transactionsService.TRANSACTION.create(tx, {
                amount: 100,
                fromId: wallet.id,
                toId: wallet.id
              });
            } catch (err) {
              caughtErr = err;
            }
          });
          expect(caughtErr).toBeUndefined();
        });

        it('sets payload properties on the transaction', async () => {
          expect(transaction).toBeDefined();
          expect(transaction.amount).toBe(100);
          expect(transaction.fromId).toBe(wallet.id);
          expect(transaction.toId).toBe(wallet.id);
        });

      });
    });

  });

});