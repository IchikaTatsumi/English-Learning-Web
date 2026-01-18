import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  // ✅ SỬA LỖI: Thêm || '5432' vào bên trong parseInt để đảm bảo luôn là string
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'english_learning',
  // Lưu ý: Nếu file này nằm trong src/core/config, bạn có thể cần lùi lại 2 cấp thư mục (../..) để quét entity
  entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
  synchronize: true,
  autoLoadEntities: true,
};
