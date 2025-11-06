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

/**
 * ✅ Updated Response DTO with firstLearnedAt
 */
export class VocabularyProgressResponseDto {
  @ApiProperty()
  vocabId: number;

  @ApiProperty()
  isLearned: boolean;

  @ApiProperty()
  isBookmarked: boolean;

  /**
   * ✅ Ngày học xong đầu tiên (chỉ set một lần)
   * Hiển thị trong tab "Learned"
   */
  @ApiProperty({ nullable: true })
  firstLearnedAt: Date | null;

  /**
   * ✅ Ngày ôn tập gần nhất
   * Update khi bookmark hoặc practice
   */
  @ApiProperty({ nullable: true })
  lastReviewedAt: Date | null;

  @ApiProperty()
  practiceAttempts: number;

  @ApiProperty()
  practiceCorrectCount: number;

  @ApiProperty()
  accuracy: number;
}
