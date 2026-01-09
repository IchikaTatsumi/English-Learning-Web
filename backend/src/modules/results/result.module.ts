import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Result } from './entities/result.entity';
import { ResultController } from './result.controller';
import { ResultService } from './result.service';
import { QuizQuestionModule } from '../quizquestions/quizquestion.module';
import { VocabularyModule } from '../vocabularies/vocabulary.module';
// ✅ Import Module này để kết nối logic tính điểm
import { VocabularyProgressModule } from '../vocabularyprogress/vocabulary-progress.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Result]),
    forwardRef(() => QuizQuestionModule),
    forwardRef(() => VocabularyModule),
    VocabularyProgressModule, // ✅ Đã thêm
  ],
  controllers: [ResultController],
  providers: [ResultService],
  exports: [ResultService, TypeOrmModule.forFeature([Result])],
})
export class ResultModule {}
