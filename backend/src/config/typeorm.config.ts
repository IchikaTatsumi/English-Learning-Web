import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';
import { FileEntity } from 'src/modules/files/entities/file.entity';
import { Permission } from 'src/modules/permission/entities/permission.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenvConfig({
  path: '.env',
});

const config = {
  type: 'postgres',
  host: `${process.env.POSTGRES_HOST || 'localhost'}`,
  port: `${process.env.POSTGRES_PORT || 5432}`,
  username: `${process.env.POSTGRES_USER}`,
  password: `${process.env.POSTGRES_PASSWORD}`,
  database: `${process.env.POSTGRES_DB}`,
  autoLoadEntities: true,
  synchronize: true,
  logging: false,
  entities: [User, FileEntity, Permission],
};

export default registerAs('typeorm', () => config);
export const dataSource = new DataSource(config as DataSourceOptions);
