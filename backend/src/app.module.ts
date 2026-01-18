import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';

// Các module hiện có
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/users/user.module'; // ✅ Sửa UserModule -> UserModule (dựa trên convention thường gặp)
import { TopicModule } from './modules/topics/topic.module';
import { VocabularyModule } from './modules/vocabularies/vocabulary.module';
import { QuizModule } from './modules/quiz/quiz.module';
import { QuizQuestionModule } from './modules/quizquestions/quizquestion.module';
import { ResultModule } from './modules/results/result.module';
import { SpeechModule } from './modules/speech/speech.module';
import { ProgressModule } from './modules/progress/progress.module';
import { VocabularyProgressModule } from './modules/vocabularyprogress/vocabulary-progress.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './core/config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(databaseConfig), // ✅ Hết lỗi Unsafe argument vì file config đã có

    // Feature Modules
    AuthModule,
    UserModule, // Kiểm tra kỹ tên class export trong file user.module.ts (UserModule hay UserModule)
    TopicModule,
    VocabularyModule,
    QuizModule,
    QuizQuestionModule,
    ResultModule,
    SpeechModule,
    ProgressModule,
    VocabularyProgressModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
