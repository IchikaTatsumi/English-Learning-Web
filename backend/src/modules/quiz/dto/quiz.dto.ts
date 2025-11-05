import {
  IsEnum,
  IsNumber,
  IsOptional,
  Min,
  Max,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AutoExpose } from 'src/core/decorators/auto-expose.decorator';
import { BaseResponseDto } from 'src/core/dto/base.dto';

export class CreateQuizDto {
  @ApiProperty({
    description: 'Difficulty level for quiz',
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Mixed Levels'],
    default: 'Mixed Levels',
  })
  @IsString()
  difficultyLevel: string;

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
}

export class AnswerQuestionDto {
  @ApiProperty({ description: 'Question ID' })
  @IsNumber()
  questionId: number;

  @ApiProperty({ description: 'User answer' })
  @IsString()
  answer: string;

  @ApiProperty({ description: 'Speech text from STT', required: false })
  @IsString()
  @IsOptional()
  speechText?: string;
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
  userId: number;
  difficultyMode: string;
  totalQuestions: number;
  score: number;
  createdAt: Date;
  results?: unknown[]; // ✅ FIX: Đổi any[] thành unknown[]
}

// ✅ FIX: Thêm interface cho question result
interface QuestionResult {
  questionId: number;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  word: string;
}

@AutoExpose()
export class QuizResultDto extends BaseResponseDto {
  quizId: number;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  completedAt: Date;
  questions: QuestionResult[]; // ✅ FIX: Dùng interface thay vì inline type
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
