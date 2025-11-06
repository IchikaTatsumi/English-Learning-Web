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
 * ✅ IMPROVED: Vocabulary Filter DTO với logic rõ ràng hơn
 *
 * Flow:
 * 1. Search từ khóa trong vocabulary (word, meaning)
 * 2. Filter theo difficulty
 * 3. Filter theo topic (ID hoặc name)
 * 4. Optional pagination
 */
export class VocabularyFilterDto {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VOCABULARY SEARCH
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  @ApiProperty({
    description:
      'Search vocabulary by word, English meaning, or Vietnamese meaning',
    required: false,
    example: 'hello',
  })
  @IsString()
  @IsOptional()
  search?: string;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DIFFICULTY FILTER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  @ApiProperty({
    description: 'Filter by difficulty level',
    enum: DifficultyLevel,
    required: false,
    example: DifficultyLevel.BEGINNER,
  })
  @IsEnum(DifficultyLevel)
  @IsOptional()
  difficulty?: DifficultyLevel;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TOPIC FILTER (Either ID or Name, not both)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  @ApiProperty({
    description: 'Filter by exact topic ID',
    required: false,
    example: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  topicId?: number;

  @ApiProperty({
    description: 'Filter by topic name (partial match, case-insensitive)',
    required: false,
    example: 'Animals',
    // NOTE: If both topicId and topicName are provided, topicId takes priority
  })
  @IsString()
  @IsOptional()
  topicName?: string;

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
    description: 'Enable pagination (default: false)',
    default: false,
    required: false,
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  paginate?: boolean;

  @ApiProperty({
    description: 'Page number (only if paginate=true)',
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
    description: 'Items per page (only if paginate=true)',
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
    enum: ['word', 'createdAt', 'difficultyLevel', 'topicName'],
    default: 'word',
    required: false,
  })
  @IsString()
  @IsOptional()
  sortBy?: 'word' | 'createdAt' | 'difficultyLevel' | 'topicName';

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
 * ✅ Response DTO với metadata đầy đủ
 */
export class VocabularyListResponseDto {
  @ApiProperty({ description: 'Array of vocabularies', type: 'array' })
  data: any[];

  @ApiProperty({ description: 'View mode used', enum: ViewModeEnum })
  viewMode: ViewModeEnum;

  @ApiProperty({ description: 'Total count matching filters' })
  total: number;

  @ApiProperty({ description: 'Whether pagination is enabled' })
  paginated: boolean;

  // Pagination metadata (conditional)
  @ApiProperty({ description: 'Current page', required: false })
  page?: number;

  @ApiProperty({ description: 'Items per page', required: false })
  limit?: number;

  @ApiProperty({ description: 'Total pages', required: false })
  totalPages?: number;

  // Applied filters
  @ApiProperty({ description: 'Applied filters', required: false })
  filters?: {
    search?: string;
    difficulty?: DifficultyLevel;
    topicId?: number;
    topicName?: string;
  };
}

/**
 * ✅ NEW: Topic lookup DTO for autocomplete
 */
export class TopicLookupDto {
  @ApiProperty({
    description: 'Search term for topic name',
    required: false,
    example: 'Anim',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({
    description: 'Maximum results to return',
    default: 10,
    minimum: 1,
    maximum: 50,
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
 * ✅ Topic search response
 */
export class TopicSearchResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  topicName: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  vocabularyCount: number;
}
