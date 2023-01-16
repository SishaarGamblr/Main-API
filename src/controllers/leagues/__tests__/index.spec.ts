import Container from 'typedi';
import server from '../../../app';
import { AlreadyExistsError } from '../../../lib/errors/errors';
import { LeaguesService } from '../../../services/leagues';

describe('Leagues Controller', () => {
  afterEach(() => {
    Container.reset();
  });

  describe('GET /leagues/:id', () => {
    describe('fetching a league which does not exist', () => {
      it('throws an error', async () => {
        const dummyId = 'dummy';
        const response = await server.inject({
          method: 'GET',
          url: `/leagues/${dummyId}`,
        });

        expect(response.statusCode).toBe(404);
        expect(response.json()).toMatchInlineSnapshot(`
          {
            "code": "NOT_FOUND",
            "error": "Not Found",
            "message": "dummy not found.",
            "statusCode": 404,
          }
        `);
      });
    });

    describe('fetching a league', () => {
      const id = 'dummy';

      beforeAll(async () => {
        const mockLeagueService = {
          findOne: () => Promise.resolve({ id }),
        };

        Container.set(LeaguesService, mockLeagueService);
      });

      it('fetches the league', async () => {
        const response = await server.inject({
          method: 'GET',
          url: `/leagues/${id}`,
        });

        expect(response.statusCode).toBe(200);
        expect(response.json().id).toBe(id);
      });
    });
  });

  describe('POST /leagues', () => {
    describe('successfully creating a league', () => {
      const mockLeague = {
        id: 'dummy',
        ownerId: 'dummy',
        name: 'dummy',
      };

      beforeAll(async () => {
        const mockLeagueService = {
          create: () => Promise.resolve(mockLeague),
        };

        Container.set(LeaguesService, mockLeagueService);
      });

      it('creates the league', async () => {
        const response = await server.inject({
          method: 'POST',
          url: `/leagues`,
          payload: {
            ownerId: 'dummy',
            name: 'dummy',
          },
          headers: {
            authorization: 'Bearer test',
          },
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toMatchInlineSnapshot(`
          {
            "id": "dummy",
            "name": "dummy",
            "ownerId": "dummy",
          }
        `);
      });
    });

    describe('successfully creating a league and inferring the owner from the auth token', () => {
      const mockLeague = {
        id: 'dummy',
        ownerId: 'dummy',
        name: 'dummy',
      };

      let mockLeagueService = {
        create: jest.fn().mockResolvedValue(mockLeague),
      };

      beforeAll(async () => {
        Container.set(LeaguesService, mockLeagueService);
      });

      it('creates the league', async () => {
        const response = await server.inject({
          method: 'POST',
          url: `/leagues`,
          payload: {
            name: 'dummy',
          },
          headers: {
            authorization: 'Bearer test',
          },
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toMatchInlineSnapshot(`
          {
            "id": "dummy",
            "name": "dummy",
            "ownerId": "dummy",
          }
        `);
      });

      it('uses the request decoded auth object to determine the owner ID', async () => {
        expect(mockLeagueService.create).toHaveBeenCalledWith({
          ownerId: 'dummyUserId',
          name: 'dummy',
        });
      });
    });

    describe('failing to create a league', () => {
      beforeAll(async () => {
        const mockLeagueService = {
          create: () => Promise.reject(new AlreadyExistsError('User')),
        };

        Container.set(LeaguesService, mockLeagueService);
      });

      it('returns an error', async () => {
        const response = await server.inject({
          method: 'POST',
          url: `/leagues`,
          payload: {
            ownerId: 'dummy',
            name: 'dummy',
          },
          headers: {
            authorization: 'Bearer test',
          },
        });

        expect(response.statusCode).toBe(400);
        expect(response.json()).toMatchInlineSnapshot(`
          {
            "code": "RESOURCE_ALREADY_EXISTS",
            "error": "Bad Request",
            "message": "User already exists.",
            "statusCode": 400,
          }
        `);
      });
    });

    describe('not providing a complete payload', () => {
      it('returns an error', async () => {
        const response = await server.inject({
          method: 'POST',
          url: `/leagues`,
          payload: {},
          headers: {
            authorization: 'Bearer test',
          },
        });

        expect(response.statusCode).toBe(400);
        expect(response.json()).toMatchInlineSnapshot(`
          {
            "error": "Bad Request",
            "message": "body must have required property 'name'",
            "statusCode": 400,
          }
        `);
      });
    });

    describe('an unexpected error occurs', () => {
      beforeAll(async () => {
        const mockLeagueService = {
          create: () => Promise.reject(new Error('Unexpected Error')),
        };

        Container.set(LeaguesService, mockLeagueService);
      });

      it('returns a 500 error', async () => {
        const response = await server.inject({
          method: 'POST',
          url: `/leagues`,
          payload: {
            ownerId: 'dummy',
            name: 'dummy',
          },
          headers: {
            authorization: 'Bearer test',
          },
        });

        expect(response.statusCode).toBe(500);
        expect(response.json()).toMatchInlineSnapshot(`
          {
            "error": "Internal Server Error",
            "message": "Unexpected Error",
            "statusCode": 500,
          }
        `);
      });
    });
  });

  describe('DELETE /leagues/:id', () => {
    describe('deleting a league which does not exist', () => {
      it('returns without throwing an error', async () => {
        const response = await server.inject({
          method: 'DELETE',
          url: '/leagues/dummyId',
        });

        expect(response.statusCode).toBe(200);
        expect(response.body).toBe('ok');
      });
    });

    describe('deleting a league which exists', () => {
      beforeAll(async () => {
        const mockLeagueService = {
          delete: () => Promise.resolve(),
        };

        Container.set(LeaguesService, mockLeagueService);
      });

      it('deletes the league', async () => {
        const response = await server.inject({
          method: 'DELETE',
          url: '/leagues/dummyId',
        });

        expect(response.statusCode).toBe(200);
        expect(response.body).toBe('ok');
      });
    });

    describe('an unexpected error occurs', () => {
      beforeAll(async () => {
        const mockLeagueService = {
          delete: () => Promise.reject(new Error('Unexpected error')),
        };

        Container.set(LeaguesService, mockLeagueService);
      });

      it('throws an error', async () => {
        const response = await server.inject({
          method: 'DELETE',
          url: '/leagues/dummyId',
        });

        expect(response.statusCode).toBe(500);
        expect(response.json()).toMatchInlineSnapshot(`
          {
            "error": "Internal Server Error",
            "message": "Unexpected error",
            "statusCode": 500,
          }
        `);
      });
    });
  });

  describe('PUT /leagues/:id/invite/:userId', () => {
    describe('inviting a user', () => {
      beforeAll(async () => {
        const mockLeagueService = {
          inviteUser: () => Promise.resolve(),
        };

        Container.set(LeaguesService, mockLeagueService);
      });

      it('successfully completes', async () => {
        const response = await server.inject({
          method: 'PUT',
          url: '/leagues/dummyLeagueId/invite/dummyUserId',
        });

        expect(response.statusCode).toBe(200);
        expect(response.body).toBe('ok');
      });
    });

    describe('an unexpected error is encountered', () => {
      beforeAll(async () => {
        const mockLeagueService = {
          inviteUser: () => Promise.reject(new Error('Unexpected error')),
        };

        Container.set(LeaguesService, mockLeagueService);
      });

      it('throws an error', async () => {
        const response = await server.inject({
          method: 'PUT',
          url: '/leagues/dummyLeagueId/invite/dummyUserId',
        });

        expect(response.statusCode).toBe(500);
        expect(response.json()).toMatchInlineSnapshot(`
          {
            "error": "Internal Server Error",
            "message": "Unexpected error",
            "statusCode": 500,
          }
        `);
      });
    });
  });
});
