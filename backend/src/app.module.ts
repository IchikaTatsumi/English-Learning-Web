import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SnakeCaseInterceptor } from './core/interceptors/snake_case.interceptor';
import { DataSourceOptions } from 'typeorm';
import * as path from 'path';

// ✅ Import all modules
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/users/user.module';
import { TopicModule } from './modules/topics/topic.module';
import { VocabularyModule } from './modules/vocabularies/vocabulary.module';
import { VocabularyProgressModule } from './modules/vocabularyprogress/vocabulary-progress.module';
import { QuizQuestionModule } from './modules/quizquestions/quizquestion.module';
import { QuizModule } from './modules/quiz/quiz.module';
import { ResultModule } from './modules/results/result.module';
import { ProgressModule } from './modules/progress/progress.module';
import { SpeechModule } from './modules/speech/speech.module';

@Module({
  imports: [
    // ✅ Environment Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // ✅ Database Configuration
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
      username: process.env.POSTGRES_USER || 'dbuser',
      password: process.env.POSTGRES_PASSWORD || 'dbpassword',
      database: process.env.POSTGRES_DB || 'mydatabase',
      synchronize: true,
      logging: true,
      entities: [path.join(__dirname, 'modules/**/entities/*.entity.{ts,js}')],
      autoLoadEntities: true,
    } as DataSourceOptions),

    // ✅ Feature Modules
    AuthModule,
    UserModule,
    TopicModule,
    VocabularyModule,
    VocabularyProgressModule,
    QuizQuestionModule,
    QuizModule,
    ResultModule,
    ProgressModule,
    SpeechModule,
  ],
  providers: [
    // ✅ Global Interceptor for snake_case conversion
    {
      provide: APP_INTERCEPTOR,
      useClass: SnakeCaseInterceptor,
    },
  ],
})
export class AppModule {}
