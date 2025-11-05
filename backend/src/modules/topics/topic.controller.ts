import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { TopicService } from './topic.service';
import { TopicDTO, CreateTopicDTO, UpdateTopicDTO } from './dto/topic.dto';
import { Role } from 'src/core/enums/role.enum';
import { Roles } from 'src/core/decorators/role.decorator';
import { Public } from 'src/core/decorators/public.decorator';

interface RequestWithUser {
  user: {
    id: number;
  };
}

// ✅ FIX: Thêm interface cho TopicWithProgress
interface TopicWithProgress {
  id: number;
  topicName: string;
  description: string;
  createdAt: Date;
  totalWords: number;
  learnedCount: number;
}

@ApiBearerAuth()
@ApiTags('Topics')
@Controller('topics')
export class TopicController {
  constructor(private readonly topicService: TopicService) {}

  @Public()
  @Get()
  @ApiOkResponse({ type: [TopicDTO] })
  async getAllTopics(): Promise<TopicDTO[]> {
    const topics = await this.topicService.getAllTopics();
    return TopicDTO.fromEntities(topics);
  }

  @Get('with-progress')
  @ApiOkResponse({ type: [TopicDTO] })
  async getTopicsWithProgress(
    @Request() req: RequestWithUser,
  ): Promise<TopicWithProgress[]> {
    const userId = Number(req.user.id);
    return await this.topicService.getTopicsWithProgress(userId);
  }

  @Public()
  @Get(':id')
  @ApiOkResponse({ type: TopicDTO })
  async getTopicById(@Param('id', ParseIntPipe) id: number): Promise<TopicDTO> {
    const topic = await this.topicService.getTopicById(id);
    return TopicDTO.fromEntity(topic);
  }

  @Roles(Role.ADMIN)
  @Post()
  @ApiOkResponse({ type: TopicDTO })
  async createTopic(@Body() dto: CreateTopicDTO): Promise<TopicDTO> {
    const topic = await this.topicService.createTopic(dto);
    return TopicDTO.fromEntity(topic);
  }

  @Roles(Role.ADMIN)
  @Put(':id')
  @ApiOkResponse({ type: TopicDTO })
  async updateTopic(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTopicDTO,
  ): Promise<TopicDTO> {
    const topic = await this.topicService.updateTopic(id, dto);
    return TopicDTO.fromEntity(topic);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiOkResponse({ type: TopicDTO })
  async deleteTopic(@Param('id', ParseIntPipe) id: number): Promise<TopicDTO> {
    const topic = await this.topicService.deleteTopic(id);
    return TopicDTO.fromEntity(topic);
  }
}
