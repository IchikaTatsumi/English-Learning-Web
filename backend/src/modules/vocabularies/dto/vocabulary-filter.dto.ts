import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { DifficultyLevel } from 'src/core/enums/difficulty-level.enum';
import { ViewModeEnum } from 'src/core/enums/view-mode.enum';

/**
 * ✅ VOCABULARY FILTER DTO
 * Hỗ trợ:
 * - Search vocab by word/meaning
 * - Filter by difficulty (All = Mixed Levels, Beginner, Intermediate, Advanced)
 * - Filter by topic (All = null, hoặc chọn specific topic)
 * - Filter learned vocab (isLearned + sortBy recently)
 * - Reset filter
 */
export class VocabularyFilterDto {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VOCABULARY SEARCH
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  @ApiProperty({
    description: 'Search vocabulary by word, English/Vietnamese meaning',
    required: false,
    example: 'hello',
  })
  @IsString()
  @IsOptional()
  search?: string;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DIFFICULTY FILTER
  // All difficulties = "Mixed Levels" (hoặc undefined)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  @ApiProperty({
    description: 'Filter by difficulty level. "Mixed Levels" = All',
    enum: DifficultyLevel,
    required: false,
    example: DifficultyLevel.BEGINNER,
  })
  @IsEnum(DifficultyLevel)
  @IsOptional()
  difficulty?: DifficultyLevel;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TOPIC FILTER
  // All topics = null/undefined
  // Specific topic = topicId
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  @ApiProperty({
    description: 'Filter by topic ID. Omit for "All topics"',
    required: false,
    example: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  topicId?: number;

  /**
   * ✅ NEW: Topic search (for autocomplete dropdown)
   * Khi user gõ vào input "Category", trả về list topics matching
   */
  @ApiProperty({
    description: 'Search topics by name (for topic dropdown)',
    required: false,
    example: 'Animal',
  })
  @IsString()
  @IsOptional()
  topicSearch?: string;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LEARNED VOCAB FILTER (Tab "Learned")
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  @ApiProperty({
    description: 'Filter only learned vocabularies',
    required: false,
    default: false,
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  onlyLearned?: boolean;

  @ApiProperty({
    description: 'Sort learned vocab by recently learned (for Learned tab)',
    required: false,
    default: false,
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  recentlyLearned?: boolean;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VIEW MODE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  @ApiProperty({
    description: 'Display mode (Grid or List)',
    enum: ViewModeEnum,
    default: ViewModeEnum.GRID,
    required: false,
  })
  @IsEnum(ViewModeEnum)
  @IsOptional()
  viewMode?: ViewModeEnum;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PAGINATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  @ApiProperty({
    description: 'Enable pagination',
    default: false,
    required: false,
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  paginate?: boolean;

  @ApiProperty({
    description: 'Page number',
    default: 1,
    minimum: 1,
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiProperty({
    description: 'Items per page',
    default: 20,
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SORTING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  @ApiProperty({
    description: 'Sort field',
    enum: ['word', 'createdAt', 'difficultyLevel', 'firstLearnedAt'],
    default: 'word',
    required: false,
  })
  @IsString()
  @IsOptional()
  sortBy?: 'word' | 'createdAt' | 'difficultyLevel' | 'firstLearnedAt';

  @ApiProperty({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    default: 'ASC',
    required: false,
  })
  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * ✅ Response DTO
 */
export class VocabularyListResponseDto {
  @ApiProperty()
  data: any[];

  @ApiProperty({ enum: ViewModeEnum })
  viewMode: ViewModeEnum;

  @ApiProperty()
  total: number;

  @ApiProperty()
  paginated: boolean;

  @ApiProperty({ required: false })
  page?: number;

  @ApiProperty({ required: false })
  limit?: number;

  @ApiProperty({ required: false })
  totalPages?: number;

  @ApiProperty({ required: false })
  filters?: {
    search?: string;
    difficulty?: DifficultyLevel;
    topicId?: number;
    onlyLearned?: boolean;
    recentlyLearned?: boolean;
  };
}

/**
 * ✅ Topic Autocomplete DTO
 * Dùng cho endpoint /vocabularies/topics/search
 */
export class TopicSearchDto {
  @ApiProperty({
    description: 'Search term for topic name',
    required: false,
    example: 'Anim',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({
    description: 'Max results',
    default: 10,
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit?: number;
}

/**
 * ✅ Topic in search results
 */
export class TopicSearchResultDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  topicName: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  vocabularyCount: number;
}
