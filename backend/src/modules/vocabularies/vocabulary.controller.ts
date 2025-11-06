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
  ApiQuery,
  ApiOperation,
} from '@nestjs/swagger';
import { VocabularyService } from './vocabulary.service';
import {
  CreateVocabularyDTO,
  UpdateVocabularyDTO,
  VocabularyResponseDto,
  VocabularyWithProgressDto,
} from './dto/vocabulary.dto';
import {
  VocabularyFilterDto,
  VocabularyListResponseDto,
  TopicSearchResponseDto,
} from './dto/vocabulary-filter.dto';
import { Role } from 'src/core/enums/role.enum';
import { Roles } from 'src/core/decorators/role.decorator';
import { Public } from 'src/core/decorators/public.decorator';
import { ViewModeEnum } from 'src/core/enums/view-mode.enum';

interface RequestWithUser {
  user: {
    id: number;
  };
}

@ApiBearerAuth()
@ApiTags('Vocabulary')
@Controller('vocabularies')
export class VocabularyController {
  constructor(private readonly vocabularyService: VocabularyService) {}

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✅ NEW: Main endpoint với filtering và pagination
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  @Public()
  @Get('filter')
  @ApiOperation({
    summary: 'Get vocabularies with flexible filtering and optional pagination',
  })
  @ApiOkResponse({ type: VocabularyListResponseDto })
  async getVocabulariesWithFilter(
    @Query() filters: VocabularyFilterDto,
  ): Promise<VocabularyListResponseDto> {
    const viewMode = filters.viewMode || ViewModeEnum.GRID;
    const paginate = filters.paginate === true;

    // Get filtered data
    const { data, total } =
      await this.vocabularyService.getVocabulariesWithFilters(filters);

    // Build response
    const response: VocabularyListResponseDto = {
      data: VocabularyResponseDto.fromEntities(data),
      viewMode,
      total,
      paginated: paginate,
    };

    // Add pagination metadata if enabled
    if (paginate) {
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      response.page = page;
      response.limit = limit;
      response.totalPages = Math.ceil(total / limit);
    }

    // Add applied filters
    response.filters = {};
    if (filters.search) response.filters.search = filters.search;
    if (filters.difficulty) response.filters.difficulty = filters.difficulty;
    if (filters.topicId) response.filters.topicId = filters.topicId;

    return response;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✅ NEW: Search topics endpoint
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  @Public()
  @Get('topics/search')
  @ApiOperation({ summary: 'Search topics for category filter' })
  @ApiQuery({ name: 'q', required: false, type: String })
  @ApiOkResponse({ type: [TopicSearchResponseDto] })
  async searchTopics(
    @Query('q') searchTerm?: string,
  ): Promise<TopicSearchResponseDto[]> {
    return await this.vocabularyService.searchTopics(searchTerm);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // EXISTING ENDPOINTS (unchanged)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  @Public()
  @Get()
  @ApiOkResponse({ type: [VocabularyResponseDto] })
  async getAllVocabularies(): Promise<VocabularyResponseDto[]> {
    const vocabularies = await this.vocabularyService.getAllVocabularies();
    return VocabularyResponseDto.fromEntities(vocabularies);
  }

  @Get('with-progress')
  @ApiOkResponse({ type: [VocabularyWithProgressDto] })
  async getVocabulariesWithProgress(
    @Request() req: RequestWithUser,
    @Query('topicId') topicId?: number,
  ) {
    const userId = Number(req.user.id);
    return await this.vocabularyService.getVocabulariesWithProgress(
      userId,
      topicId,
    );
  }

  @Public()
  @Get('topic/:topicId')
  @ApiOkResponse({ type: [VocabularyResponseDto] })
  async getVocabulariesByTopicId(
    @Param('topicId', ParseIntPipe) topicId: number,
  ): Promise<VocabularyResponseDto[]> {
    const vocabularies =
      await this.vocabularyService.getVocabulariesByTopicId(topicId);
    return VocabularyResponseDto.fromEntities(vocabularies);
  }

  @Public()
  @Get('search')
  @ApiQuery({ name: 'q', required: true })
  @ApiOkResponse({ type: [VocabularyResponseDto] })
  async searchVocabularies(
    @Query('q') query: string,
  ): Promise<VocabularyResponseDto[]> {
    const vocabularies = await this.vocabularyService.searchVocabularies(query);
    return VocabularyResponseDto.fromEntities(vocabularies);
  }

  @Public()
  @Get('random')
  @ApiQuery({ name: 'count', required: false })
  @ApiQuery({ name: 'difficulty', required: false })
  @ApiOkResponse({ type: [VocabularyResponseDto] })
  async getRandomVocabularies(
    @Query('count') count?: number,
    @Query('difficulty') difficulty?: string,
  ): Promise<VocabularyResponseDto[]> {
    const vocabularies = await this.vocabularyService.getRandomVocabularies(
      count || 10,
      difficulty,
    );
    return VocabularyResponseDto.fromEntities(vocabularies);
  }

  @Public()
  @Get(':id')
  @ApiOkResponse({ type: VocabularyResponseDto })
  async getVocabularyById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<VocabularyResponseDto> {
    const vocabulary = await this.vocabularyService.getVocabularyById(id);
    return VocabularyResponseDto.fromEntity(vocabulary);
  }

  @Roles(Role.ADMIN)
  @Post()
  @ApiOkResponse({ type: VocabularyResponseDto })
  async createVocabulary(
    @Body() dto: CreateVocabularyDTO,
  ): Promise<VocabularyResponseDto> {
    const vocabulary = await this.vocabularyService.createVocabulary(dto);
    return VocabularyResponseDto.fromEntity(vocabulary);
  }

  @Roles(Role.ADMIN)
  @Put(':id')
  @ApiOkResponse({ type: VocabularyResponseDto })
  async updateVocabulary(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVocabularyDTO,
  ): Promise<VocabularyResponseDto> {
    const vocabulary = await this.vocabularyService.updateVocabulary(id, dto);
    return VocabularyResponseDto.fromEntity(vocabulary);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  async deleteVocabulary(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.vocabularyService.deleteVocabulary(id);
  }
}
