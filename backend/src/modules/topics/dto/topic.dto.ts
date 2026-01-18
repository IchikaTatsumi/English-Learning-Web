import { IsString, IsOptional } from 'class-validator';
import { AutoExpose } from 'src/core/decorators/auto-expose.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { Topic } from '../entities/topic.entity';

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
    dto.topic_id = topic.id;
    dto.topic_name = topic.topicName;
    dto.description = topic.description;
    dto.created_at = topic.createdAt;

    // ✅ Map trường 'vocabularyCount' được TypeORM loadRelationCountAndMap gán vào
    if (topic['vocabularyCount'] !== undefined) {
      // 🛠️ SỬA LỖI: Dùng String(...) để đảm bảo tham số truyền vào parseInt luôn là chuỗi
      dto.vocabulary_count =
        parseInt(String(topic['vocabularyCount']), 10) || 0;
    } else if (topic.vocabularies) {
      dto.vocabulary_count = topic.vocabularies.length;
    } else {
      dto.vocabulary_count = 0;
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
