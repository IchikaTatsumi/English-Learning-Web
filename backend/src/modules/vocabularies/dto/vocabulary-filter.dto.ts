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

// ✅ REMOVED: Không duplicate TopicSearchResultDto nữa
// Import từ topics module thay thế: import { TopicSearchResultDto } from '../../topics/dto/topic-filter.dto';

/**
 * ✅ VOCABULARY FILTER DTO
 */
export class VocabularyFilterDto {
  @ApiProperty({
    description: 'Search vocabulary by word, English/Vietnamese meaning',
    required: false,
    example: 'hello',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({
    description: 'Filter by difficulty level. "Mixed Levels" = All',
    enum: DifficultyLevel,
    required: false,
    example: DifficultyLevel.BEGINNER,
  })
  @IsEnum(DifficultyLevel)
  @IsOptional()
  difficulty?: DifficultyLevel;

  @ApiProperty({
    description: 'Filter by topic ID. Omit for "All topics"',
    required: false,
    example: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  topicId?: number;

  @ApiProperty({
    description: 'Search topics by name (for topic dropdown)',
    required: false,
    example: 'Animal',
  })
  @IsString()
  @IsOptional()
  topicSearch?: string;

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

  @ApiProperty({
    description: 'Display mode (Grid or List)',
    enum: ViewModeEnum,
    default: ViewModeEnum.GRID,
    required: false,
  })
  @IsEnum(ViewModeEnum)
  @IsOptional()
  viewMode?: ViewModeEnum;

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
 * ✅ Topic Autocomplete DTO (local to vocabulary module)
 * Note: TopicSearchResultDto is imported from topics module
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
