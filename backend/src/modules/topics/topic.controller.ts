import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { TopicService } from './topic.service';
import { CreateTopicDTO, UpdateTopicDTO, TopicDTO } from './dto/topic.dto';
import {
  TopicSearchDto,
  TopicListResponseDto,
  TopicSearchResultDto,
} from './dto/topic-filter.dto';
import { Role } from 'src/core/enums/role.enum';
import { Roles } from 'src/core/decorators/role.decorator';
import { Public } from 'src/core/decorators/public.decorator';

interface RequestWithUser {
  user: {
    id: number;
  };
}

@ApiBearerAuth()
@ApiTags('Topics')
@Controller('topics')
export class TopicController {
  constructor(private readonly topicService: TopicService) {}

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✅ PRIMARY ENDPOINT: Topic Search cho Vocabulary Filter
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  @Public()
  @Get('search')
  @ApiOperation({
    summary: '🔍 Search topics for vocabulary filter dropdown',
    description: `
      Primary endpoint for topic selection in vocabulary filters.
      
      Examples:
      - GET /topics/search → All topics
      - GET /topics/search?q=a → Topics containing 'a' (Animal, Nature, etc.)
      - GET /topics/search?q=ani&limit=5 → Top 5 matching topics
      
      Response includes vocabulary count for each topic.
    `,
  })
  @ApiOkResponse({
    type: [TopicSearchResultDto],
    description: 'Returns topics with vocabulary counts',
  })
  async searchTopics(
    @Query() dto: TopicSearchDto,
  ): Promise<TopicSearchResultDto[]> {
    return await this.topicService.searchTopics(dto.q, dto.limit || 10);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✅ ENDPOINT 2: Get all topics with metadata
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  @Get('list')
  @ApiOperation({
    summary: 'Get all topics with vocabulary counts',
    description:
      'Returns complete topic list with learned counts if authenticated',
  })
  @ApiOkResponse({ type: TopicListResponseDto })
  async getTopicsForFilter(
    @Request() req: RequestWithUser,
  ): Promise<TopicListResponseDto> {
    const userId = req.user?.id;
    const topics = await this.topicService.getTopicsForFilter(userId);

    return {
      topics,
      total: topics.length,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✅ ENDPOINT 3: Get topics with progress
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  @Get('progress')
  @ApiOperation({
    summary: 'Get topics with learning progress',
    description:
      'Returns topics with learned/total word counts for current user',
  })
  async getTopicsWithProgress(@Request() req: RequestWithUser): Promise<any[]> {
    const userId = req.user.id;
    return await this.topicService.getTopicsWithProgress(userId);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // EXISTING CRUD ENDPOINTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all topics' })
  @ApiOkResponse({ type: [TopicDTO] })
  async getAllTopics(): Promise<TopicDTO[]> {
    const topics = await this.topicService.getAllTopics();
    return TopicDTO.fromEntities(topics);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get topic by ID' })
  @ApiOkResponse({ type: TopicDTO })
  async getTopicById(@Param('id', ParseIntPipe) id: number): Promise<TopicDTO> {
    const topic = await this.topicService.getTopicById(id);
    return TopicDTO.fromEntity(topic);
  }

  @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create new topic (Admin only)' })
  @ApiOkResponse({ type: TopicDTO })
  async createTopic(@Body() dto: CreateTopicDTO): Promise<TopicDTO> {
    const topic = await this.topicService.createTopic(dto);
    return TopicDTO.fromEntity(topic);
  }

  @Roles(Role.ADMIN)
  @Put(':id')
  @ApiOperation({ summary: 'Update topic (Admin only)' })
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
  @ApiOperation({ summary: 'Delete topic (Admin only)' })
  async deleteTopic(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.topicService.deleteTopic(id);
  }
}
