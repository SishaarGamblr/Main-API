import Config from 'config';
import { DataSource, DataSourceOptions } from 'typeorm';

const connection: DataSourceOptions = {
  type: 'postgres',
  url: Config.get<string>('database.url'),
  ssl: Config.get<boolean>('database.ssl') && { rejectUnauthorized: false },
  // entities: ['src/entities/*.ts', 'dist/entities/*{.ts,.js}'],
  entities: [`${__dirname}/../../entities/*{.ts,.js}`],
  migrations: [`${__dirname}/migrations/*{.ts,.js}`],
};

export default new DataSource(connection);
