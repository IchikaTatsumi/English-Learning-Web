import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

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
    // Config: Load biến môi trường
    ConfigModule.forRoot({
      isGlobal: true,
      // Lưu ý: Trong Docker, file .env gốc thường không được copy vào container.
      // NestJS sẽ đọc biến môi trường từ hệ thống (do docker-compose inject vào).
      envFilePath: '.env',
    }),

    // Database
    TypeOrmModule.forRoot({
      type: 'postgres',
      // 🔴 SỬA LỖI QUAN TRỌNG TẠI ĐÂY:
      // Đổi 'localhost' thành 'postgres'.
      // Nếu biến môi trường bị thiếu, nó sẽ trỏ đúng vào container database thay vì trỏ vào chính nó.
      host: process.env.POSTGRES_HOST || 'postgres',

      port: parseInt(process.env.POSTGRES_PORT as string) || 5432,
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: process.env.POSTGRES_DB || 'english_learning',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],

      // Tự động đồng bộ schema (Chỉ nên bật ở môi trường Dev hoặc khi init dự án)
      synchronize: true,
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
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
