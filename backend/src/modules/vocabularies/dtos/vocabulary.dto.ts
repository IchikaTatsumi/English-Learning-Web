import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AutoExpose } from 'src/core/decorators/auto-expose.decorator';
import { BaseResponseDto } from 'src/core/dto/base.dto';
import { DifficultyLevel } from 'src/core/enums/difficulty-level.enum';

export class CreateVocabularyDTO {
  @ApiProperty({ description: 'Topic ID' })
  @IsNumber()
  @IsNotEmpty()
  topicId: number;

  @ApiProperty({ description: 'English word', example: 'Hello' })
  @IsString()
  @IsNotEmpty()
  word: string;

  @ApiProperty({
    description: 'IPA pronunciation',
    example: 'həˈloʊ',
    required: false,
  })
  @IsString()
  @IsOptional()
  ipa?: string;

  @ApiProperty({
    description: 'English meaning',
    example: 'Used as a greeting',
  })
  @IsString()
  @IsNotEmpty()
  meaningEn: string;

  @ApiProperty({
    description: 'Vietnamese meaning',
    example: 'Xin chào',
  })
  @IsString()
  @IsNotEmpty()
  meaningVi: string;

  @ApiProperty({
    description: 'Example sentence',
    example: 'Hello, how are you?',
    required: false,
  })
  @IsString()
  @IsOptional()
  exampleSentence?: string;

  @ApiProperty({
    description: 'Audio file path',
    example: '/audio/hello.mp3',
    required: false,
  })
  @IsString()
  @IsOptional()
  audioPath?: string;

  @ApiProperty({
    description: 'Difficulty level',
    enum: DifficultyLevel,
    default: DifficultyLevel.BEGINNER,
  })
  @IsEnum(DifficultyLevel)
  difficultyLevel: DifficultyLevel;
}

export class UpdateVocabularyDTO {
  @ApiProperty({ description: 'Topic ID', required: false })
  @IsNumber()
  @IsOptional()
  topicId?: number;

  @ApiProperty({ description: 'English word', required: false })
  @IsString()
  @IsOptional()
  word?: string;

  @ApiProperty({ description: 'IPA pronunciation', required: false })
  @IsString()
  @IsOptional()
  ipa?: string;

  @ApiProperty({ description: 'English meaning', required: false })
  @IsString()
  @IsOptional()
  meaningEn?: string;

  @ApiProperty({ description: 'Vietnamese meaning', required: false })
  @IsString()
  @IsOptional()
  meaningVi?: string;

  @ApiProperty({ description: 'Example sentence', required: false })
  @IsString()
  @IsOptional()
  exampleSentence?: string;

  @ApiProperty({ description: 'Audio file path', required: false })
  @IsString()
  @IsOptional()
  audioPath?: string;

  @ApiProperty({ description: 'Difficulty level', required: false })
  @IsEnum(DifficultyLevel)
  @IsOptional()
  difficultyLevel?: DifficultyLevel;
}

@AutoExpose()
export class VocabularyResponseDto extends BaseResponseDto {
  id: number;
  topicId: number;
  word: string;
  ipa: string;
  meaningEn: string;
  meaningVi: string;
  exampleSentence: string;
  audioPath: string;
  difficultyLevel: DifficultyLevel;
  createdAt: Date;
  topic?: {
    id: number;
    topicName: string;
    description: string;
  };
}

@AutoExpose()
export class VocabularyWithProgressDto extends VocabularyResponseDto {
  isLearned: boolean;
  bestScore: number;
  lastReviewed: Date;
  attemptCount: number;
}
