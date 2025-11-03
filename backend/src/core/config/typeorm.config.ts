import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';
import { typeormConfig } from 'src/database/data-source';

dotenvConfig({
  path: '.env',
});

export default registerAs('typeorm', () => typeormConfig);
