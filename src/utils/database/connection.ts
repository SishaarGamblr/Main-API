import Config from 'config';
import { DataSource, DataSourceOptions } from 'typeorm';

const connection: DataSourceOptions = {
  type: 'postgres',
  url: Config.get<string>('database.url'),
  ssl: Config.get<boolean>('database.ssl') && { rejectUnauthorized: false },
  entities: ['src/entities/*.ts', 'dist/entities/*{.ts,.js}'],
  migrations: [`${__dirname}/migrations/*{.ts,.js}`],
  // @ts-ignore
  cli: {
    entitiesDir: 'src/entities',
    migrationsDir: 'src/utils/database/migrations',
  },
};

export default new DataSource(connection);
