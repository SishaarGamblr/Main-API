import Container from 'typedi';
import { User } from '../../../entities/User';
import { UserService } from '../../../services/users';
import server from '../../../app';

describe('Login Controller', () => {
  afterEach(() => {
    Container.reset();
  });

  describe('POST /login', () => {
    describe('successfully logging in as a user', () => {
      let user: User;
      let token: string;

      beforeAll(async () => {
        user = await Container.get(UserService).create({
          name: 'Sishaar',
          email: 'sishaar@gmail.com',
          phone: '5713156933',
          password: 'dummy',
        });
      });

      afterAll(async () => {
        await user?.remove();
      });

      it('returns a token and sets a refresh token as a cookie', async () => {
        const response = await server.inject({
          method: 'POST',
          url: '/login',
          payload: {
            phone: user.phone,
            password: 'dummy',
          },
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toHaveProperty('token');
        token = response.json().token;
      });

      it('successfully uses the new token to authenticate', async () => {
        const response = await server.inject({
          method: 'POST',
          url: '/verify',
          headers: {
            authorization: `Bearer ${token}`,
          },
        });

        expect(response.statusCode).toBe(200);
        expect(response.body).toBe('ok');
      });
    });

    describe('logging in as a customer which does not exist', () => {
      it('returns an error', async () => {
        const response = await server.inject({
          method: 'POST',
          url: '/login',
          payload: {
            phone: 'dummy',
            password: 'dummy',
          },
        });

        expect(response.statusCode).toBe(404);
        expect(response.json()).toMatchInlineSnapshot(`
          {
            "code": "NOT_FOUND",
            "error": "Not Found",
            "message": "user not found.",
            "statusCode": 404,
          }
        `);
      });
    });

    describe('logging in as a customer with an incorrect password', () => {
      let user: User;

      beforeAll(async () => {
        user = await Container.get(UserService).create({
          name: 'Sishaar',
          email: 'sishaar@gmail.com',
          phone: '5713156933',
          password: 'dummy',
        });
      });

      afterAll(async () => {
        await user?.remove();
      });

      it('returns a token and sets a refresh token as a cookie', async () => {
        const response = await server.inject({
          method: 'POST',
          url: '/login',
          payload: {
            phone: user.phone,
            password: 'wrongpassword',
          },
        });

        expect(response.statusCode).toBe(401);
        expect(response.json()).toMatchInlineSnapshot(`
          {
            "code": "UNAUTHORIZED",
            "error": "Unauthorized",
            "message": "Unauthorized",
            "statusCode": 401,
          }
        `);
      });
    });
  });

  describe('POST /refresh', () => {
    describe('successfully refreshing a token', () => {
      let user: User;
      let newToken: string;
      let cookie: string;

      beforeAll(async () => {
        user = await Container.get(UserService).create({
          name: 'Sishaar',
          email: 'sishaar@gmail.com',
          phone: '5713156933',
          password: 'dummy',
        });
      });

      afterAll(async () => {
        await user?.remove();
      });

      it('successfully logs in', async () => {
        const response = await server.inject({
          method: 'POST',
          url: '/login',
          payload: {
            phone: user.phone,
            password: 'dummy',
          },
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toHaveProperty('token');
        expect(response.cookies.length).toEqual(1);
        const cookies = response.cookies[0] as { name: string; value: string };
        expect(cookies.name).toBe('refreshToken');
        cookie = cookies.value;
      });

      it('successfully uses the refresh token to retrieve a new token', async () => {
        const response = await server.inject({
          method: 'POST',
          url: '/refresh',
          cookies: {
            refreshToken: cookie,
          },
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toHaveProperty('token');

        newToken = response.json().token;
      });

      it('successfully uses the new token to authenticate', async () => {
        const response = await server.inject({
          method: 'POST',
          url: '/verify',
          cookies: {
            refreshToken: cookie,
          },
          headers: {
            authorization: `Bearer ${newToken}`,
          },
        });

        expect(response.statusCode).toBe(200);
        expect(response.body).toBe('ok');
      });
    });

    describe('refreshing with a stale token', () => {
      const dummyToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoidXNlcl9lYTFkNTJhMmE5MTUwNzEiLCJpYXQiOjE2NzM1NzI5NjAsImV4cCI6MTY3MzU3Mjk3MH0.EUG7YKkQt-HPD33r6_SxtpukJDjmbs99Qd8Bu69YhLw';

      it('returns an error', async () => {
        const response = await server.inject({
          method: 'POST',
          url: '/refresh',
          cookies: {
            refreshToken: dummyToken,
          },
        });

        expect(response.statusCode).toBe(401);
        expect(response.json()).toMatchInlineSnapshot(`
          {
            "code": "FST_JWT_AUTHORIZATION_TOKEN_EXPIRED",
            "error": "Unauthorized",
            "message": "Authorization token expired",
            "statusCode": 401,
          }
        `);
      });
    });
  });

  describe('POST /logout', () => {
    describe('successfully logging out', () => {
      let user: User;
      let cookie: string;

      beforeAll(async () => {
        user = await Container.get(UserService).create({
          name: 'Sishaar',
          email: 'sishaar@gmail.com',
          phone: '5713156933',
          password: 'dummy',
        });
      });

      afterAll(async () => {
        await user?.remove();
      });

      it('successfully logs in', async () => {
        const response = await server.inject({
          method: 'POST',
          url: '/login',
          payload: {
            phone: user.phone,
            password: 'dummy',
          },
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toHaveProperty('token');
        expect(response.cookies.length).toEqual(1);
        const cookies = response.cookies[0] as { name: string; value: string };
        expect(cookies.name).toBe('refreshToken');
        cookie = cookies.value;
      });

      it('successfully logs out', async () => {
        const response = await server.inject({
          method: 'POST',
          url: '/logout',
          cookies: {
            refreshToken: cookie,
          },
        });

        expect(response.statusCode).toBe(200);
        expect(response.cookies).toMatchInlineSnapshot(`
          [
            {
              "expires": 1970-01-01T00:00:00.000Z,
              "name": "refreshToken",
              "path": "/",
              "value": "",
            },
          ]
        `);
      });
    });

    describe('logging out with an incorrect token', () => {
      const dummyToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoidXNlcl9lYTFkNTJhMmE5MTUwNzEiLCJpYXQiOjE2NzM1NzI5NjAsImV4cCI6MTY3MzU3Mjk3MH0.EUG7YKkQt-HPD33r6_SxtpukJDjmbs99Qd8Bu69YhLw';

      it('returns an error', async () => {
        const response = await server.inject({
          method: 'POST',
          url: '/logout',
          cookies: {
            refreshToken: dummyToken,
          },
        });

        expect(response.statusCode).toBe(401);
        expect(response.json()).toMatchInlineSnapshot(`
          {
            "code": "FST_JWT_AUTHORIZATION_TOKEN_EXPIRED",
            "error": "Unauthorized",
            "message": "Authorization token expired",
            "statusCode": 401,
          }
        `);
      });
    });
  });
});
