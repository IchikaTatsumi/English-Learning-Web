import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AutoExpose } from 'src/core/decorators/auto-expose.decorator';
import { BaseResponseDto } from 'src/core/dto/base.dto';
import { DifficultyMode } from '../entities/quiz.entity';
import { QuizQuestionResponseDto } from '../../quizquestions/dtos/quizquestion.dto';

export class CreateQuizDto {
  @ApiProperty({
    description: 'Difficulty mode for quiz',
    enum: DifficultyMode,
    default: DifficultyMode.MIXED_LEVELS,
  })
  @IsEnum(DifficultyMode)
  difficultyMode: DifficultyMode;

  @ApiProperty({
    description: 'Number of questions in quiz',
    default: 10,
    minimum: 5,
    maximum: 50,
  })
  @IsNumber()
  @Min(5)
  @Max(50)
  @IsOptional()
  totalQuestions?: number;

  @ApiProperty({
    description: 'Topic ID to generate quiz from (optional)',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  topicId?: number;

  @ApiProperty({
    description: 'Lesson ID to generate quiz from (optional)',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  lessonId?: number;
}

export class AnswerQuestionDto {
  @ApiProperty({ description: 'Question ID' })
  @IsNumber()
  questionId: number;

  @ApiProperty({ description: 'User answer' })
  userAnswer: string;
}

export class SubmitQuizDto {
  @ApiProperty({
    description: 'Array of answered questions',
    type: [AnswerQuestionDto],
  })
  answers: AnswerQuestionDto[];
}

@AutoExpose()
export class QuizResponseDto extends BaseResponseDto {
  id: number;
  userId: string;
  difficultyMode: DifficultyMode;
  totalQuestions: number;
  score: number;
  completed: boolean;
  createdAt: Date;
  questions?: QuizQuestionResponseDto[];
}

@AutoExpose()
export class QuizResultDto extends BaseResponseDto {
  quizId: number;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  completedAt: Date;
  questions: {
    questionId: number;
    questionText: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    vocabId: number;
    word: string;
  }[];
}

@AutoExpose()
export class QuizStatisticsDto extends BaseResponseDto {
  totalQuizzes: number;
  averageScore: number;
  totalQuestionsAnswered: number;
  correctAnswers: number;
  accuracy: number;
  bestScore: number;
  recentQuizzes: QuizResponseDto[];
}
