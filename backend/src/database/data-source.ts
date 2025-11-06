import { DataSource, DataSourceOptions } from 'typeorm';
import { config as dotenvConfig } from 'dotenv';
import * as path from 'path';

dotenvConfig({ path: path.resolve(__dirname, '../../.env') });

export const typeormConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  username: process.env.POSTGRES_USER || 'dbuser',
  password: process.env.POSTGRES_PASSWORD || 'dbpassword',
  database: process.env.POSTGRES_DB || 'mydatabase',
  synchronize: true,
  logging: true,
  entities: [path.join(__dirname, '../modules/**/entities/*.entity.{ts,js}')],
  migrations: [path.join(__dirname, 'migrations/*.{ts,js}')],
};

export const AppDataSource = new DataSource(typeormConfig);
