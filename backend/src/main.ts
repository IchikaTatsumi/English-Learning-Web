import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { SnakeCaseInterceptor } from './core/interceptors/snake_case.interceptor';
import { webcrypto } from 'crypto';

// ✅ KEEP: Polyfill crypto for Docker Alpine Linux
if (!globalThis.crypto) {
  (globalThis as any).crypto = webcrypto;
}

async function bootstrap() {
  // ✅ KEEP: Environment variables debug
  console.log('\n=== 🔍 Environment Variables Debug ===');
  console.log('POSTGRES_HOST:', process.env.POSTGRES_HOST);
  console.log('POSTGRES_PORT:', process.env.POSTGRES_PORT);
  console.log('POSTGRES_USER:', process.env.POSTGRES_USER);
  console.log(
    'POSTGRES_PASSWORD:',
    process.env.POSTGRES_PASSWORD ? '***' : 'undefined',
  );
  console.log('POSTGRES_DB:', process.env.POSTGRES_DB);
  console.log('PORT:', process.env.PORT);
  console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? '***' : 'undefined');
  console.log('=====================================\n');

  const app = await NestFactory.create(AppModule);

  // ✅ IMPROVED: CORS Configuration (giữ logic cũ + thêm các origin cần thiết)
  const allowedOrigins = [
    'http://localhost:3000', // Frontend dev
    'http://localhost:4000', // Backend (for testing)
    'http://frontend:3000', // Docker internal network
    process.env.FRONTEND_URL, // Production URL from .env
  ].filter(Boolean); // Remove undefined values

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`⚠️ CORS blocked origin: ${origin}`);
        console.warn(`Allowed origins: ${allowedOrigins.join(', ')}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Authorization'],
  });

  // ✅ KEEP: Global prefix (QUAN TRỌNG - Đây là dòng bạn đã có)
  app.setGlobalPrefix('api');

  // ✅ KEEP: Validation pipe with transformation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true, // ✅ ADDED: Auto convert types
      },
    }),
  );

  // ✅ KEEP: Snake case interceptor for responses
  // app.useGlobalInterceptors(new SnakeCaseInterceptor());

  // ✅ KEEP: Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('English Learning API')
    .setDescription(
      'API for English vocabulary learning with speech recognition',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Users', 'User management')
    .addTag('Vocabulary', 'Vocabulary management')
    .addTag('Topics', 'Topic management')
    .addTag('Quiz', 'Quiz and questions')
    .addTag('Progress', 'Learning progress tracking')
    .addTag('Results', 'Quiz results')
    .addTag('Speech', 'Speech recognition & synthesis')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;

  await app.listen(port);

  // ✅ IMPROVED: Better startup logs
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║  🚀 Backend Server Started Successfully                ║');
  console.log('╠════════════════════════════════════════════════════════╣');
  console.log(`║  📍 API:     http://localhost:${port}/api                 ║`);
  console.log(`║  📚 Swagger: http://localhost:${port}/api/docs            ║`);
  console.log(
    `║  🔧 Mode:    ${process.env.NODE_ENV || 'development'}                      ║`,
  );
  console.log('╚════════════════════════════════════════════════════════╝\n');
}

// ✅ KEEP: Handle Promise rejection properly
bootstrap().catch((error) => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});
