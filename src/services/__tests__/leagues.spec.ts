import Container from 'typedi';
import { User } from '../../entities/User';
import { LeaguesService } from '../leagues';
import { League } from '../../entities/League';
import { UsersToLeagues } from '../../entities/UsersInLeagues';
import { ForbiddenError, NotFoundError } from '../../lib/errors/errors';

describe('Leagues Service', () => {
  const leaguesService = Container.get(LeaguesService);
  let owner: User;

  beforeAll(async () => {
    owner = await User.create({
      phone: 'dummy',
      name: 'dummy',
      email: 'dummy',
      password: 'dummy',
    }).save();
  });

  afterAll(async () => {
    await owner.remove();
  });

  afterAll(async () => {
    const leagues = await League.find();
    const users = await User.find();

    await League.remove(leagues);
    await User.remove(users);
  });

  describe('findOne', () => {
    describe('finding an existing league', () => {
      let league: League;

      beforeAll(async () => {
        league = await League.create({
          name: 'dummy',
          owner,
        }).save();
      });

      afterAll(async () => {
        await league?.remove();
      });

      it('returns the league', async () => {
        const response = await leaguesService.findOne(league.id);

        expect(response).toBeDefined();
        expect(response?.id).toBe(league.id);
      });
    });

    describe('finding a deleted league', () => {
      let league: League;

      beforeAll(async () => {
        league = await League.create({
          owner,
          name: 'dummy',
          deleted: true,
        }).save();
      });

      afterAll(async () => {
        await league?.remove();
      });

      it('returns the league with the `deleted` parameter', async () => {
        const response = await leaguesService.findOne(league.id, {
          deleted: true,
        });

        expect(response).toBeDefined();
        expect(response?.id).toBe(league.id);
      });

      it('does not return the league without the `deleted` parameter', async () => {
        const response = await leaguesService.findOne(league.id);
        expect(response).toBeNull();
      });
    });

    describe('finding a non-existent league', () => {
      it('returns null', async () => {
        const response = await leaguesService.findOne('dummy');
        expect(response).toBeNull();
      });

      describe('findOneOrFail', () => {
        it('throws an error null', async () => {
          const response = await leaguesService
            .findOneOrFail('dummy')
            .catch((err) => err);
          expect(response).toBeInstanceOf(NotFoundError);
        });
      });
    });
  });

  describe('create', () => {
    describe('creating a new league', () => {
      let league: League;

      afterAll(async () => {
        await league?.remove();
      });

      it('does not throw an error', async () => {
        let caughtErr;
        try {
          league = await leaguesService.create({
            ownerId: owner.id,
            name: 'dummy',
          });
        } catch (err) {
          caughtErr = err;
        }

        expect(caughtErr).toBeUndefined();
      });

      it('sets payload properties on the league', async () => {
        expect(league).toBeDefined();
        expect(league.name).toBe('dummy');
      });

      it('designates the user creating the league as the owner', async () => {
        const userToLeague = await UsersToLeagues.findOne({
          where: {
            userId: owner.id,
          },
        });

        expect(userToLeague).toBeDefined();
        expect(userToLeague?.leagueId).toBe(league.id);
        expect(userToLeague?.isOwner).toBe(true);
      });
    });

    describe('an unexpected error is encountered', () => {
      let spy: jest.SpyInstance;

      beforeAll(async () => {
        spy = jest
          .spyOn(League.prototype, 'save')
          .mockRejectedValue(new Error('Unexpected error'));
      });

      afterAll(() => {
        spy?.mockRestore();
      });

      it('throws the unexpected error', async () => {
        let caughtErr;
        try {
          await leaguesService.create({
            ownerId: owner.id,
            name: 'dummy',
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
    describe('deleting an existing league', () => {
      let league: League;
      beforeAll(async () => {
        league = await League.create({
          owner: owner,
          name: 'dummy',
        }).save();
      });

      afterAll(async () => {
        await league.remove();
      });

      it('does not throw an error', async () => {
        let caughtErr;
        try {
          await leaguesService.delete(league.id);
        } catch (err) {
          caughtErr = err;
        }

        expect(caughtErr).toBeUndefined();
      });

      it('deletes the league', async () => {
        await league.reload();
        expect(league.deleted).toBeTruthy();
      });
    });

    describe('deleting a non-existing league', () => {
      it('does not throw an error', async () => {
        expect(() => leaguesService.delete('dummy')).not.toThrowError();
      });
    });

    describe('deleting a league which does not belong to the request owner', () => {
      let league: League;
      beforeAll(async () => {
        league = await League.create({
          owner: owner,
          name: 'dummy',
        }).save();
      });

      afterAll(async () => {
        await league.remove();
      });

      it('throws an error', async () => {
        let caughtErr;
        try {
          await leaguesService.delete(league.id, { ownerId: 'dummy'});
        } catch (err) {
          caughtErr = err;
        }

        expect(caughtErr).toBeDefined();
        expect(caughtErr).toBeInstanceOf(ForbiddenError);
      })
    })
  });

  describe('inviteUser', () => {
    describe('inviting a user to a league', () => {
      let invitedUser: User;
      let league: League;

      beforeAll(async () => {
        league = await League.create({
          owner: owner,
          name: 'dummy',
        }).save();

        invitedUser = await User.create({
          phone: 'invited_dummy',
          name: 'invited_dummy',
          email: 'invited_dummy',
          password: 'invited_password',
        }).save();
      });

      afterAll(async () => {
        await league.remove();
        await invitedUser.remove();
      });

      it('does not throw an error', async () => {
        let caughtErr;
        try {
          await leaguesService.inviteUser(league.id, invitedUser.id, owner.id);
        } catch (err) {
          caughtErr = err;
        }

        expect(caughtErr).toBeUndefined();
      });

      it('links the user to the league pending they accept their invite', async () => {
        let userAddedToLeague = await UsersToLeagues.findOneBy({
          leagueId: league.id,
          userId: invitedUser.id,
        });

        expect(userAddedToLeague).toBeDefined();
        expect(userAddedToLeague?.invitedById).toBe(owner.id);
      });
    });

    describe('inviting a user to a league which does not exist', () => {
      let invitedUser: User;

      beforeAll(async () => {
        invitedUser = await User.create({
          phone: 'invited_dummy',
          name: 'invited_dummy',
          email: 'invited_dummy',
          password: 'invited_password',
        }).save();
      });

      afterAll(async () => {
        await invitedUser.remove();
      });

      it('throws an error', async () => {
        let caughtErr;
        try {
          await leaguesService.inviteUser('dummy', invitedUser.id, owner.id);
        } catch (err) {
          caughtErr = err;
        }

        expect(caughtErr).toMatchInlineSnapshot(
          `[FastifyError: league not found.]`
        );
      });
    });

    describe('inviting a user which does not exist to a league', () => {
      let league: League;

      beforeAll(async () => {
        league = await League.create({
          owner: owner,
          name: 'dummy',
        }).save();
      });

      afterAll(async () => {
        await league.remove();
      });

      it('throws an error', async () => {
        let caughtErr;
        try {
          await leaguesService.inviteUser(league.id, 'dummy', owner.id);
        } catch (err) {
          caughtErr = err;
        }

        expect(caughtErr).toMatchInlineSnapshot(
          `[FastifyError: user not found.]`
        );
      });
    });
  });
});
