import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizQuestion } from './entities/quizquestion.entity';
import { QuizQuestionController } from './quizquestion.controller';
import { QuizQuestionService } from './quizquestion.service';
import { VocabularyModule } from '../vocabularies/vocabulary.module';
import { Vocabulary } from '../vocabularies/entities/vocabulary.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([QuizQuestion, Vocabulary]),
    forwardRef(() => VocabularyModule),
  ],
  controllers: [QuizQuestionController],
  providers: [QuizQuestionService],
  exports: [QuizQuestionService, TypeOrmModule.forFeature([QuizQuestion])],
})
export class QuizQuestionModule {}
