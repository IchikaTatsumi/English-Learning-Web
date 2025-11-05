import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { CamelCaseTransformPipe } from './core/pipes/camel-case-transform.pipe';
import { SnakeCaseInterceptor } from './core/interceptors/snake_case.interceptor';

async function bootstrap() {
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
    new CamelCaseTransformPipe({
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

  const port = process.env.PORT || 4000; // ✅ ĐÃ SỬA TỪ 3001 THÀNH 4000

  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
