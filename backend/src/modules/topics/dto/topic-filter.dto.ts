import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

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

export class TopicSearchResultDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  topicName: string;

  @ApiProperty({ nullable: true })
  description: string | null;

  @ApiProperty()
  vocabularyCount: number;

  @ApiProperty({ nullable: true })
  learnedCount?: number;
}

export class TopicListResponseDto {
  @ApiProperty({ type: [TopicSearchResultDto] })
  topics: TopicSearchResultDto[];

  @ApiProperty()
  total: number;
}
