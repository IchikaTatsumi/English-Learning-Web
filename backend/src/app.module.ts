import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller'; // ✅ PHẢI CÓ DÒNG NÀY
import { AppService } from './app.service'; // ✅ (Optional)

// Import các modules khác
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/users/user.module';
import { TopicModule } from './modules/topics/topic.module';
import { VocabularyModule } from './modules/vocabularies/vocabulary.module';
import { QuizModule } from './modules/quiz/quiz.module';
import { QuizQuestionModule } from './modules/quizquestions/quizquestion.module';
import { ResultModule } from './modules/results/result.module';
import { ProgressModule } from './modules/progress/progress.module';
import { VocabularyProgressModule } from './modules/vocabularyprogress/vocabulary-progress.module';
import { SpeechModule } from './modules/speech/speech.module';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT) || 5432,
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: process.env.POSTGRES_DB || 'english_learning',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production', // ⚠️ Chỉ dùng dev
      logging: process.env.NODE_ENV === 'development',
    }),

    // Feature Modules
    AuthModule,
    UserModule,
    TopicModule,
    VocabularyModule,
    QuizModule,
    QuizQuestionModule,
    ResultModule,
    ProgressModule,
    VocabularyProgressModule,
    SpeechModule,
  ],
  controllers: [AppController], // ✅ PHẢI CÓ DÒNG NÀY
  providers: [], // AppService nếu có
})
export class AppModule {}
