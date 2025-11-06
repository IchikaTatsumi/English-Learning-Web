import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SnakeCaseInterceptor } from './core/interceptors/snake_case.interceptor';
import typeormConfig from './core/config/typeorm.config';

// ✅ Import all modules
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/users/user.module';
import { TopicModule } from './modules/topics/topic.module';
import { VocabularyModule } from './modules/vocabularies/vocabulary.module';
import { VocabularyProgressModule } from './modules/vocabularyprogress/vocabulary-progress.module'; // ✅
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
      load: [typeormConfig],
    }),

    // ✅ Database Configuration
    TypeOrmModule.forRoot({
      ...typeormConfig,
      autoLoadEntities: true,
    } as any),

    // ✅ Feature Modules
    AuthModule,
    UserModule,
    TopicModule,
    VocabularyModule,
    VocabularyProgressModule, // ✅ ADD THIS
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
