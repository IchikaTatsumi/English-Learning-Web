import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quiz } from './entities/quiz.entity';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { QuizQuestionModule } from '../quizquestions/quizquestion.module';
import { VocabularyModule } from '../vocabularies/vocabulary.module';
import { Vocabulary } from '../vocabularies/entities/vocabulary.entity';
import { Result } from '../results/entities/result.entity';
import { QuizQuestion } from '../quizquestions/entities/quizquestion.entity'; // ✅ Add this

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Quiz,
      Vocabulary,
      Result,
      QuizQuestion, // ✅ Add QuizQuestion to repositories
    ]),
    forwardRef(() => QuizQuestionModule),
    forwardRef(() => VocabularyModule),
  ],
  controllers: [QuizController],
  providers: [QuizService],
  exports: [QuizService, TypeOrmModule.forFeature([Quiz])],
})
export class QuizModule {}
