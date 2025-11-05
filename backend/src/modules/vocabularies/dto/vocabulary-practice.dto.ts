// backend/src/modules/vocabularies/dto/vocabulary-practice.dto.ts
import { IsNumber, IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PracticeQuestionDto {
  @ApiProperty()
  @IsNumber()
  questionId: number;

  @ApiProperty()
  @IsString()
  questionType: string;

  @ApiProperty()
  @IsString()
  questionText: string;

  @ApiProperty()
  @IsString()
  correctAnswer: string;

  @ApiProperty()
  @IsString()
  userAnswer: string;

  @ApiProperty()
  @IsBoolean()
  isCorrect: boolean;
}

export class SubmitPracticeDto {
  @ApiProperty()
  @IsNumber()
  vocabId: number;

  @ApiProperty({ type: [PracticeQuestionDto] })
  answers: PracticeQuestionDto[];
}

export class BookmarkVocabDto {
  @ApiProperty()
  @IsNumber()
  vocabId: number;

  @ApiProperty()
  @IsBoolean()
  isBookmarked: boolean;
}

export class VocabularyProgressResponseDto {
  @ApiProperty()
  vocabId: number;

  @ApiProperty()
  isLearned: boolean;

  @ApiProperty()
  isBookmarked: boolean;

  @ApiProperty()
  lastReviewedAt: Date | null;

  @ApiProperty()
  practiceAttempts: number;

  @ApiProperty()
  practiceCorrectCount: number;

  @ApiProperty()
  accuracy: number;
}
