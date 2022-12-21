import connection from "../src/utils/database/connection";

beforeAll(async () => {
  await connection.initialize();
});

afterAll(async () => {
  await connection.destroy();
})