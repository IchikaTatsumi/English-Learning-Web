import { IsString, IsOptional } from 'class-validator';
import { AutoExpose } from 'src/core/decorators/auto-expose.decorator';
import { BaseResponseDto } from 'src/core/dto/base.dto';
import { ApiProperty } from '@nestjs/swagger';

@AutoExpose()
export class TopicDTO extends BaseResponseDto {
  id: number;
  topicName: string;
  description: string;
  createdAt: Date;
  lessonsCount?: number;
  learnedCount?: number;
}

export class CreateTopicDTO {
  @ApiProperty()
  @IsString()
  topicName: string;

  @ApiProperty({ required: false })
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