import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { SnakeCaseInterceptor } from './core/interceptors/snake_case.interceptor';

async function bootstrap() {
  // ✅ DEBUG: In ra environment variables
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

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Validation pipe with transformation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Snake case interceptor for responses
  app.useGlobalInterceptors(new SnakeCaseInterceptor());

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('English Learning API')
    .setDescription(
      'API for English vocabulary learning with speech recognition',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;

  await app.listen(port);

  console.log(`\n🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs\n`);
}

bootstrap();
