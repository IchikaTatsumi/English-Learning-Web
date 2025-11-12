import { Module, forwardRef } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { UserModule } from 'src/modules/users/user.module';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';

/**
 * ✅ Helper: Parse JWT expiration from environment
 * Supports both string formats ('24h', '7d') and number (seconds)
 */
function getJwtExpiration():
  | number
  | `${number}${'ms' | 's' | 'm' | 'h' | 'd' | 'w' | 'y'}` {
  const expiresIn = process.env.JWT_EXPIRES_IN;

  // If not set, default to 24 hours
  if (!expiresIn) {
    return '24h' as const;
  }

  // If it's a pure number string (seconds), convert to number
  if (/^\d+$/.test(expiresIn)) {
    return parseInt(expiresIn, 10);
  }

  // Otherwise return as string (e.g., '24h', '7d', '30m')
  return expiresIn as `${number}${'ms' | 's' | 'm' | 'h' | 'd' | 'w' | 'y'}`;
}

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => UserModule),
    PassportModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: {
        expiresIn: getJwtExpiration(),
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    JwtStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
