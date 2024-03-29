import Container from 'typedi';
import server from '../../../app';
import { UserService } from '../../../services/users';
import { AlreadyExistsError } from '../../../lib/errors/errors';

describe('Users Controller', () => {
  afterEach(() => {
    Container.reset();
  });

  describe('GET /users/:id', () => {
    describe('fetching a user which does not exist', () => {
      it('throws an error', async () => {
        const dummyId = 'dummy';
        const response = await server.inject({
          method: 'GET',
          url: `/users/${dummyId}`,
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

    describe('fetching a user', () => {
      const id = 'dummy';

      beforeAll(async () => {
        const mockUserService = {
          findOne: () => Promise.resolve({ id }),
        };

        Container.set(UserService, mockUserService);
      });

      it('fetches the user', async () => {
        const response = await server.inject({
          method: 'GET',
          url: `/users/${id}`,
        });

        expect(response.statusCode).toBe(200);
        expect(response.json().id).toBe(id);
      });
    });
  });

  describe('POST /users', () => {
    describe('successfully creating a user', () => {
      const mockUser = {
        id: 'dummy',
        email: 'dummy',
        phone: 'dummy',
        name: 'dummy',
      };

      beforeAll(async () => {
        const mockUserService = {
          create: () => Promise.resolve(mockUser),
        };

        Container.set(UserService, mockUserService);
      });

      it('creates the user', async () => {
        const response = await server.inject({
          method: 'POST',
          url: `/users`,
          payload: {
            email: 'dummy',
            phone: 'dummy',
            name: 'dummy',
            password: 'dummy'
          },
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toMatchInlineSnapshot(`
          {
            "email": "dummy",
            "id": "dummy",
            "name": "dummy",
            "phone": "dummy",
          }
        `);
      });
    });

    describe('failing to create a user', () => {
      beforeAll(async () => {
        const mockUserService = {
          create: () => Promise.reject(new AlreadyExistsError('User')),
        };

        Container.set(UserService, mockUserService);
      });

      it('returns an error', async () => {
        const response = await server.inject({
          method: 'POST',
          url: `/users`,
          payload: {
            email: 'dummy',
            phone: 'dummy',
            name: 'dummy',
            password: 'dummy',
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
          url: `/users`,
          payload: {},
        });

        expect(response.statusCode).toBe(400);
        expect(response.json()).toMatchInlineSnapshot(`
          {
            "error": "Bad Request",
            "message": "body must have required property 'email'",
            "statusCode": 400,
          }
        `);
      });
    });

    describe('an unexpected error occurs', () => {
      beforeAll(async () => {
        const mockUserService = {
          create: () => Promise.reject(new Error('Unexpected Error')),
        };

        Container.set(UserService, mockUserService);
      });

      it('returns a 500 error', async () => {
        const response = await server.inject({
          method: 'POST',
          url: `/users`,
          payload: {
            email: 'dummy',
            phone: 'dummy',
            name: 'dummy',
            password: 'dummy',
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

  describe('DELETE /users/:id', () => {
    describe('deleting a user which does not exist', () => {
      it('returns without throwing an error', async () => {
        const response = await server.inject({
          method: 'DELETE',
          url: '/users/dummyUserId',
          headers: {
            authorization: 'Bearer test',
          },
        });

        expect(response.statusCode).toBe(200);
        expect(response.body).toBe('ok');
      });
    });

    describe('deleting a user which exists', () => {
      beforeAll(async () => {
        const mockUserService = {
          delete: () => Promise.resolve(),
        };

        Container.set(UserService, mockUserService);
      });

      it('deletes the user', async () => {
        const response = await server.inject({
          method: 'DELETE',
          url: '/users/dummyUserId',
          headers: {
            authorization: 'Bearer test',
          },
        });

        expect(response.statusCode).toBe(200);
        expect(response.body).toBe('ok');
      });
    });

    describe('deleting a user which is different from the inferred user', () => {
      beforeAll(async () => {
        const mockUserService = {
          delete: () => Promise.resolve(),
        };

        Container.set(UserService, mockUserService);
      });

      it('throws an error', async () => {
        const response = await server.inject({
          method: 'DELETE',
          url: '/users/dummyId',
          headers: {
            authorization: 'Bearer test',
          },
        });

        expect(response.statusCode).toBe(403);
        expect(response.json()).toMatchInlineSnapshot(`
          {
            "code": "FORBIDDEN",
            "error": "Forbidden",
            "message": "Forbidden",
            "statusCode": 403,
          }
        `);
      });
    });

    describe('an unexpected error occurs', () => {
      beforeAll(async () => {
        const mockUserService = {
          delete: () => Promise.reject(new Error('Unexpected error')),
        };

        Container.set(UserService, mockUserService);
      });

      it('throws an error', async () => {
        const response = await server.inject({
          method: 'DELETE',
          url: '/users/dummyUserId',
          headers: {
            authorization: 'Bearer test',
          },
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
