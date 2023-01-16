import Container from "typedi";
import { User } from "../../entities/User";
import { Wallet } from "../../entities/Wallet";
import { WalletsService } from "../wallets";
import { NotFoundError } from "../../lib/errors/errors";


describe('Wallets Service', () => {
  const walletsService = Container.get(WalletsService);
  
  
  describe('findOneOrFail', () => {
    
    describe('finding a wallet', () => {
      let wallet: Wallet;
      let owner: User;
    
      beforeAll(async () => {
        owner = await User.create({
          email: 'dummy',
          phone: 'dummy',
          name: 'dummy',
          password: 'dummy',
        }).save();
        wallet = await Wallet.create({
          owner
        }).save();
      });
    
      afterAll(async () => {
        await owner?.remove();
        await wallet?.remove();
      });

      it('returns the wallet', async () => {
        const response = await walletsService.findOneOrFail(wallet.id);

        expect(response).toBeDefined();
        expect(response?.id).toBe(wallet.id);
      });

      it('returns the wallet with a specified owner', async () => {
        const response = await walletsService.findOneOrFail(wallet.id, { ownerId: owner.id });

        expect(response).toBeDefined();
        expect(response?.id).toBe(wallet.id);
      });

      it('does not return a wallet with a different owner', async () => {
        let caughtError: Error | unknown;
        try {
          await walletsService.findOneOrFail(wallet.id, { ownerId: 'dummy' });
        } catch (error) {
          caughtError = error;
        };
        expect(caughtError).toBeDefined();
        expect(caughtError).toBeInstanceOf(NotFoundError);
      });

      it('finds a wallet simply from the owner ID', async () => {
        const response = await walletsService.findOneOrFail(undefined, { ownerId: owner.id });

        expect(response).toBeDefined();
        expect(response?.id).toBe(wallet.id);
      });

      it('returns a deleted wallet if specified', async () => {
        await walletsService.delete(wallet.id);
        const response = await walletsService.findOneOrFail(wallet.id, { deleted: true });

        expect(response).toBeDefined();
        expect(response?.id).toBe(wallet.id);
      });

    });

  });

  describe('delete', () => {
    let wallet: Wallet;
    let owner: User;

    beforeEach(async () => {
      owner = await User.create({
        email: 'dummy',
        phone: 'dummy',
        name: 'dummy',
        password: 'dummy',
      }).save();
      wallet = await Wallet.create({
        owner
      }).save();
    });

    afterEach(async () => {
      await owner?.remove();
      await wallet?.remove();
    });

    it('deletes the wallet', async () => {
      await walletsService.delete(wallet.id);
      await wallet.reload();

      expect(wallet.deleted).toBe(true);
    });

    it('fails if a wallet does not exist', async () => {
      let caughtError: Error | unknown;
      try {
        await walletsService.delete('dummy');
      } catch (error) {
        caughtError = error;
      };
      expect(caughtError).toBeDefined();
      expect(caughtError).toBeInstanceOf(NotFoundError);
    });

    it('fails if a wallet has already been deleted', async () => {
      await walletsService.delete(wallet.id);
      let caughtError: Error | unknown;
      try {
        await walletsService.delete(wallet.id);
      } catch (error) {
        caughtError = error;
      };
      expect(caughtError).toBeDefined();
      expect(caughtError).toBeInstanceOf(NotFoundError);
    });
  });
})