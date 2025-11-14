import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
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
import { PronunciationModule } from './modules/pronunciation/pronunciation.module';

@Module({
  imports: [
    // ✅ Config Module (must be first)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database Module
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'english_learning'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),

    // Application Modules
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
    PronunciationModule,
  ],
})
export class AppModule {}
