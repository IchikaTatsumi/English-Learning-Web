import {
  IsNumber,
  IsString,
  IsBoolean,
  IsOptional,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AutoExpose } from 'src/core/decorators/auto-expose.decorator';
import { BaseResponseDto } from 'src/core/dto/base.dto';

export class CreateResultDTO {
  @ApiProperty({ description: 'Quiz ID' })
  @IsNumber()
  quizId: number;

  @ApiProperty({ description: 'Quiz Question ID' })
  @IsNumber()
  quizQuestionId: number;

  @ApiProperty({ description: 'User answer' })
  @IsString()
  @IsOptional()
  userAnswer?: string;

  @ApiProperty({ description: 'User speech text (from STT)' })
  @IsString()
  @IsOptional()
  userSpeechText?: string;

  @ApiProperty({ description: 'Is answer correct' })
  @IsBoolean()
  isCorrect: boolean;
}

export class SubmitQuizAnswerDTO {
  @ApiProperty({ description: 'Question ID' })
  @IsNumber()
  questionId: number;

  @ApiProperty({ description: 'User answer text' })
  @IsString()
  answer: string;

  @ApiProperty({ description: 'Speech text if using voice', required: false })
  @IsString()
  @IsOptional()
  speechText?: string;
}

export class SubmitQuizDTO {
  @ApiProperty({
    description: 'Array of question answers',
    type: [SubmitQuizAnswerDTO],
  })
  @IsArray()
  answers: SubmitQuizAnswerDTO[];
}

@AutoExpose()
export class ResultResponseDto extends BaseResponseDto {
  id: number;
  quizId: number;
  quizQuestionId: number;
  userId: number;
  userAnswer: string;
  userSpeechText: string;
  isCorrect: boolean;
  createdAt: Date;
  quizQuestion?: {
    id: number;
    questionText: string;
    correctAnswer: string;
    questionType: string;
    vocabulary: {
      word: string;
      meaningEn: string;
      meaningVi: string;
    };
  };
}

@AutoExpose()
export class QuizResultDTO extends BaseResponseDto {
  quizId: number;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  completedAt: Date;
  results: {
    questionId: number;
    questionText: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    word: string;
  }[];
}
