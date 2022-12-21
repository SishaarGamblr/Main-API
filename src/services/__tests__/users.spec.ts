import Container from 'typedi';
import { User } from '../../entities/User';
import { UserService } from '../users';
import { AlreadyExistsError } from '../../lib/errors/errors';
import { Wallet } from '../../entities/Wallet';

describe('Users Service', () => {
  const usersService = Container.get(UserService);

  afterAll(async () => {
    const users = await User.find();

    await User.remove(users);
  })

  describe('findOne', () => {
    describe('finding an existing user', () => {
      let user: User;

      beforeAll(async () => {
        user = await User.create({
          email: 'dummy',
          phone: 'dummy',
          name: 'dummy',
        }).save();
      });

      afterAll(async () => {
        await user?.remove();
      });

      it('returns the user', async () => {
        const response = await usersService.findOne(user.id);

        expect(response).toBeDefined();
        expect(response).toMatchObject(user);
      });
    });

    describe('finding a deleted user', () => {
      let user: User;

      beforeAll(async () => {
        user = await User.create({
          email: 'dummy',
          phone: 'dummy',
          name: 'dummy',
          deleted: true,
        }).save();
      });

      afterAll(async () => {
        await user?.remove();
      });

      it('returns the user with the `deleted` parameter', async () => {
        const response = await usersService.findOne(user.id, { deleted: true });

        expect(response).toBeDefined();
        expect(response).toMatchObject(user);
      });

      it('does not return the user without the `deleted` parameter', async () => {
        const response = await usersService.findOne(user.id);
        expect(response).toBeNull();
      });
    });

    describe('finding a non-existant user', () => {
      it('returns null', async () => {
        const response = await usersService.findOne('dummy');
        expect(response).toBeNull();
      });
    });
  });

  describe('create', () => {
    describe('creating a new user', () => {
      let user: User;

      afterAll(async () => {
        await user?.remove();
      });

      it('does not throw an error', async () => {
        let caughtErr;
        try {
          user = await usersService.create({
            email: 'dummy',
            name: 'dummy',
            phone: 'dummy',
          });
        } catch (err) {
          caughtErr = err;
        }

        expect(caughtErr).toBeUndefined();
      });

      it('sets payload properties on the user', async () => {
        expect(user).toBeDefined();
        expect(user.email).toBe('dummy');
        expect(user.name).toBe('dummy');
        expect(user.phone).toBe('dummy');
      });

      it('creates a wallet associated with the user', async () => {
        const wallet = await Wallet.findOne({
          where: { owner: { id: user.id }}
        });

        expect(wallet).toBeDefined();
      })
    });

    describe('creating an already existing user', () => {
      let user: User;

      beforeAll(async () => {
        user = await User.create({
          email: 'dummy',
          phone: 'dummy',
          name: 'dummy',
        }).save();
      });

      afterAll(async () => {
        await user?.remove();
      });

      it('throws an AlreadyExistsError', async () => {
        let caughtErr;
        try {
          user = await usersService.create({
            email: 'dummy',
            name: 'dummy',
            phone: 'dummy',
          });
        } catch (err) {
          caughtErr = err;
        }

        expect(caughtErr).toBeDefined();
        expect(caughtErr).toBeInstanceOf(AlreadyExistsError);

        // TODO: Why does the following not work?
        // expect(() => usersService.create({
        //   email: 'dummy',
        //   name: 'dummy',
        //   phone: 'dummy',
        // })).toThrowErrorMatchingInlineSnapshot();
      });
    });

    describe('an unexpected error is encountered', () => {
      let spy: jest.SpyInstance;

      beforeAll(async () => {
        spy = jest
          .spyOn(User.prototype, 'save')
          .mockRejectedValue(new Error('Unexpected error'));
      });

      afterAll(() => {
        spy?.mockRestore();
      });

      it('throws the unexpected error', async () => {
        let caughtErr;
        try {
          await usersService.create({
            email: 'dummy',
            name: 'dummy',
            phone: 'dummy',
          });
        } catch (err) {
          caughtErr = err;
        }

        expect(caughtErr).toBeDefined();
        expect(caughtErr).toMatchInlineSnapshot(`[Error: Unexpected error]`);
      });
    });
  });

  describe('delete', () => {
    describe('deleting an existing user', () => {
      let user: User;
      beforeAll(async () => {
        user = await User.create({
          email: 'dummy',
          phone: 'dummy',
          name: 'dummy',
        }).save();
      });

      afterAll(async () => {
        await user.remove();
      });

      it('does not throw an error', async () => {
        let caughtErr;
        try {
          await usersService.delete(user.id);
        } catch (err) {
          caughtErr = err;
        }

        expect(caughtErr).toBeUndefined();
      });

      it('deletes the user', async () => {
        await user.reload();
        expect(user.deleted).toBeTruthy();
      });
    });

    describe('deleting a non-existing user', () => {
      it('does not throw an error', async () => {
        expect(() => usersService.delete('dummy')).not.toThrowError();
      })
    })
  })
});
