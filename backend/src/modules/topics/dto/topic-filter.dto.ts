import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * ✅ Topic Search DTO (for autocomplete/dropdown)
 * Used by: GET /topics/search?q=Anim&limit=10
 */
export class TopicSearchDto {
  @ApiProperty({
    description: 'Search term for topic name (autocomplete)',
    required: false,
    example: 'Anim',
  })
  @IsString()
  @IsOptional()
  q?: string;

  @ApiProperty({
    description: 'Maximum number of results to return',
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
 * ✅ Topic Search Result DTO (response item)
 */
export class TopicSearchResultDto {
  @ApiProperty({ description: 'Topic ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Topic name', example: 'Animals' })
  topicName: string;

  @ApiProperty({ description: 'Topic description', nullable: true })
  description: string | null;

  @ApiProperty({
    description: 'Number of vocabularies in this topic',
    example: 25,
  })
  vocabularyCount: number;

  @ApiProperty({
    description: 'Number of learned vocabularies (only if user authenticated)',
    nullable: true,
    required: false,
  })
  learnedCount?: number;
}

/**
 * ✅ Topic List Response DTO (for GET /topics/list)
 */
export class TopicListResponseDto {
  @ApiProperty({
    type: [TopicSearchResultDto],
    description: 'Array of topics with vocab counts',
  })
  topics: TopicSearchResultDto[];

  @ApiProperty({ description: 'Total number of topics' })
  total: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ TYPE-SAFE INTERFACES FOR RAW QUERY RESULTS
// These interfaces ensure type safety when working with raw SQL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * ✅ Raw result from searchTopics query
 * Used in: topic.service.ts -> searchTopics()
 */
export interface TopicSearchRawResult {
  id: number;
  topicname: string; // PostgreSQL returns lowercase
  description: string | null;
  vocabularycount: string; // COUNT() returns string in PostgreSQL
}

/**
 * ✅ Raw result from getTopicsForFilter query
 * Used in: topic.service.ts -> getTopicsForFilter()
 */
export interface TopicListRawResult {
  id: number;
  topicname: string;
  description: string | null;
  vocabularycount: string;
}

/**
 * ✅ Raw result from vocabulary progress query
 * Used in: topic.service.ts -> getTopicsWithProgress(), getLearnedVocabCount()
 */
export interface VocabProgressRaw {
  vocabId: number;
  maxCorrect: number | string; // Can be number or string depending on DB driver
}
