import { IsEnum, IsNumber, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AutoExpose } from 'src/core/decorators/auto-expose.decorator';
import { BaseResponseDto } from 'src/core/dto/base.dto';
import { QuestionType } from '../entities/quizquestion.entity';

export class CreateQuizQuestionDto {
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
  vocabId: number;
  questionType: QuestionType;
  questionText: string;
  correctAnswer: string;
  timeLimit: number;
  createdAt: Date;
  vocabulary?: {
    id: number;
    word: string;
    meaningEn: string;
    meaningVi: string;
    ipa: string;
    difficultyLevel: string;
    topic: {
      id: number;
      topicName: string;
    };
  };
}

export class AnswerQuizQuestionDto {
  @ApiProperty({ description: 'User answer' })
  @IsString()
  userAnswer: string;

  @ApiProperty({ description: 'Speech text from STT', required: false })
  @IsString()
  @IsOptional()
  speechText?: string;
}

@AutoExpose()
export class QuestionResultDto extends BaseResponseDto {
  questionId: number;
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer: string;
  explanation?: string;
}
