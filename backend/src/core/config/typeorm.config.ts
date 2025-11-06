import { registerAs } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';
import { config as dotenvConfig } from 'dotenv';
import * as path from 'path';

dotenvConfig({
  path: path.resolve(__dirname, '../../../.env'),
});

const typeormConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  username: process.env.POSTGRES_USER || 'dbuser',
  password: process.env.POSTGRES_PASSWORD || 'dbpassword',
  database: process.env.POSTGRES_DB || 'mydatabase',
  synchronize: true,
  logging: true,
  entities: [
    path.join(__dirname, '../../modules/**/entities/*.entity.{ts,js}'),
  ],
  migrations: [path.join(__dirname, '../../database/migrations/*.{ts,js}')],
};

export default registerAs('typeorm', () => typeormConfig);
export { typeormConfig };
