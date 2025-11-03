import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import typeormConfig from './core/config/typeorm.config';

// Import all modules
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/users/user.module';
import { TopicModule } from './modules/topics/topic.module';
import { VocabularyModule } from './modules/vocabularies/vocabulary.module';
import { QuizModule } from './modules/quiz/quiz.module';
import { QuizQuestionModule } from './modules/quizquestions/quizquestion.module';
import { ResultModule } from './modules/results/result.module';
import { ProgressModule } from './modules/progress/progress.module';
import { SpeechModule } from './modules/speech/speech.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeormConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get('typeorm'),
    }),
    // Feature modules
    AuthModule,
    UserModule,
    TopicModule,
    VocabularyModule,
    QuizModule,
    QuizQuestionModule,
    ResultModule,
    ProgressModule,
    SpeechModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
