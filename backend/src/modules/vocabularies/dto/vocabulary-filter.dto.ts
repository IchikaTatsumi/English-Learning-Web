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
 * ✅ Query DTO cho vocabulary filtering với pagination optional
 */
export class VocabularyFilterDto {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SEARCH FILTERS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  @ApiProperty({
    description: 'Search by word name (vocabulary word)',
    required: false,
    example: 'hello',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({
    description: 'Filter by difficulty level',
    enum: DifficultyLevel,
    required: false,
    example: DifficultyLevel.BEGINNER,
  })
  @IsEnum(DifficultyLevel)
  @IsOptional()
  difficulty?: DifficultyLevel;

  @ApiProperty({
    description: 'Filter by topic ID (use "all" for all topics)',
    required: false,
    example: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  topicId?: number;

  @ApiProperty({
    description: 'Search topics by name',
    required: false,
    example: 'Animals',
  })
  @IsString()
  @IsOptional()
  topicSearch?: string;

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
  // PAGINATION (OPTIONAL)
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
    enum: ['word', 'createdAt', 'difficultyLevel'],
    default: 'word',
    required: false,
  })
  @IsString()
  @IsOptional()
  sortBy?: 'word' | 'createdAt' | 'difficultyLevel';

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
 * ✅ Response DTO với pagination metadata optional
 */
export class VocabularyListResponseDto {
  @ApiProperty({
    description: 'Array of vocabularies',
    type: 'array',
  })
  data: any[];

  @ApiProperty({
    description: 'View mode used',
    enum: ViewModeEnum,
  })
  viewMode: ViewModeEnum;

  @ApiProperty({
    description: 'Total count of vocabularies matching filters',
  })
  total: number;

  @ApiProperty({
    description: 'Whether pagination is enabled',
  })
  paginated: boolean;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PAGINATION FIELDS (only if paginated=true)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  @ApiProperty({
    description: 'Current page (only if paginated=true)',
    required: false,
  })
  page?: number;

  @ApiProperty({
    description: 'Items per page (only if paginated=true)',
    required: false,
  })
  limit?: number;

  @ApiProperty({
    description: 'Total pages (only if paginated=true)',
    required: false,
  })
  totalPages?: number;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FILTER METADATA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  @ApiProperty({
    description: 'Applied filters',
    required: false,
  })
  filters?: {
    search?: string;
    difficulty?: DifficultyLevel;
    topicId?: number;
    topicName?: string;
  };
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
