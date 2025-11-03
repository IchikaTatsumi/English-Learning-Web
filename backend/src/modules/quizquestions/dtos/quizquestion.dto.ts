import {
  IsEnum,
  IsNumber,
  IsString,
  IsArray,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AutoExpose } from 'src/core/decorators/auto-expose.decorator';
import { BaseResponseDto } from 'src/core/dto/base.dto';
import { QuestionType } from '../entities/quizquestion.entity';

export class CreateQuizQuestionDto {
  @ApiProperty({ description: 'Quiz ID' })
  @IsNumber()
  quizId: number;

  @ApiProperty({ description: 'Vocabulary ID' })
  @IsNumber()
  vocabId: number;

  @ApiProperty({
    description: 'Type of question',
    enum: QuestionType,
  })
  @IsEnum(QuestionType)
  questionType: QuestionType;

  @ApiProperty({ description: 'Question text' })
  @IsString()
  questionText: string;

  @ApiProperty({ description: 'Correct answer' })
  @IsString()
  correctAnswer: string;

  @ApiProperty({
    description: 'Multiple choice options',
    type: [String],
    required: false,
  })
  @IsArray()
  @IsOptional()
  options?: string[];

  @ApiProperty({
    description: 'Time limit in seconds',
    default: 30,
  })
  @IsNumber()
  @IsOptional()
  timeLimit?: number;
}

@AutoExpose()
export class QuizQuestionResponseDto extends BaseResponseDto {
  id: number;
  quizId: number;
  vocabId: number;
  questionType: QuestionType;
  questionText: string;
  correctAnswer: string;
  options: string[];
  timeLimit: number;
  userAnswer?: string;
  isCorrect?: boolean;
  createdAt: Date;
  vocabulary?: {
    id: number;
    word: string;
    meaning: string;
    ipa: string;
    level: string;
  };
}

export class AnswerQuizQuestionDto {
  @ApiProperty({ description: 'User answer' })
  @IsString()
  userAnswer: string;
}

@AutoExpose()
export class QuestionResultDto extends BaseResponseDto {
  questionId: number;
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer: string;
  explanation?: string;
}
