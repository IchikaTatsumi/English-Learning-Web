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
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres123',
  database: process.env.POSTGRES_DB || 'english_learning',
  synchronize: false,
  logging: true,
  entities: [
    path.join(__dirname, '../../modules/**/entities/*.entity.{ts,js}'),
  ],
};

export default registerAs('typeorm', () => typeormConfig);
export { typeormConfig };
