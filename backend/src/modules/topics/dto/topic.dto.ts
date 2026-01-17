import { IsString, IsOptional } from 'class-validator';
import { AutoExpose } from 'src/core/decorators/auto-expose.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { Topic } from '../entities/topic.entity';

// ❌ BỎ "extends BaseResponseDto" để tránh xung đột method static
@AutoExpose()
export class TopicDTO {
  @ApiProperty({ name: 'topic_id' })
  topic_id: number;

  @ApiProperty({ name: 'topic_name' })
  topic_name: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ name: 'vocabulary_count', required: false })
  vocabulary_count?: number;

  @ApiProperty({ name: 'created_at' })
  created_at?: Date;

  // ✅ Hàm mapping thủ công (Manual Mapping)
  static fromEntity(topic: Topic): TopicDTO {
    const dto = new TopicDTO();
    dto.topic_id = topic.id; // Map: id -> topic_id
    dto.topic_name = topic.topicName; // Map: topicName -> topic_name
    dto.description = topic.description;
    dto.created_at = topic.createdAt;

    // Xử lý đếm số lượng từ vựng (nếu có relation)
    if (topic.vocabularies) {
      dto.vocabulary_count = topic.vocabularies.length;
    }

    return dto;
  }

  static fromEntities(topics: Topic[]): TopicDTO[] {
    return topics.map((topic) => TopicDTO.fromEntity(topic));
  }
}

export class CreateTopicDTO {
  @ApiProperty({ description: 'Topic Name', example: 'Animals' })
  @IsString()
  topicName: string;

  @ApiProperty({ required: false, description: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateTopicDTO {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  topicName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
