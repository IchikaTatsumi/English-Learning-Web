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
} from './dto/vocabulary.dto';
import {
  VocabularyFilterDto,
  VocabularyListResponseDto,
} from './dto/vocabulary-filter.dto';
import { Role } from 'src/core/enums/role.enum';
import { Roles } from 'src/core/decorators/role.decorator';
import { Public } from 'src/core/decorators/public.decorator';
import { ViewModeEnum } from 'src/core/enums/view-mode.enum';
import type { RequestWithOptionalUser } from 'src/core/types/request.types';

@ApiBearerAuth()
@ApiTags('Vocabulary')
@Controller('vocabularies')
export class VocabularyController {
  constructor(private readonly vocabularyService: VocabularyService) {}

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✅ ENDPOINT 1: Main filter endpoint
  // GET /vocabularies/filter?difficulty=Beginner&topicId=1&onlyLearned=true
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  @Get('filter')
  @ApiOperation({
    summary: 'Get vocabularies with flexible filtering',
    description: `
      Filter options:
      - All topics: omit topicId
      - Specific topic: topicId=1
      - All difficulties: difficulty=Mixed Levels or omit
      - Specific difficulty: difficulty=Beginner/Intermediate/Advanced
      - Learned only: onlyLearned=true
      - Recently learned: recentlyLearned=true
    `,
  })
  @ApiOkResponse({ type: VocabularyListResponseDto })
  async getVocabulariesWithFilter(
    @Request() req: RequestWithOptionalUser,
    @Query() filters: VocabularyFilterDto,
  ): Promise<VocabularyListResponseDto> {
    const userId = req.user?.id;
    const viewMode = filters.viewMode || ViewModeEnum.GRID;
    const paginate = filters.paginate === true;

    const { data, total } =
      await this.vocabularyService.getVocabulariesWithFilters(filters, userId);

    const response: VocabularyListResponseDto = {
      data: VocabularyResponseDto.fromEntities(data),
      viewMode,
      total,
      paginated: paginate,
    };

    if (paginate) {
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      response.page = page;
      response.limit = limit;
      response.totalPages = Math.ceil(total / limit);
    }

    response.filters = {};
    if (filters.search) response.filters.search = filters.search;
    if (filters.difficulty) response.filters.difficulty = filters.difficulty;
    if (filters.topicId) response.filters.topicId = filters.topicId;
    if (filters.onlyLearned) response.filters.onlyLearned = filters.onlyLearned;
    if (filters.recentlyLearned)
      response.filters.recentlyLearned = filters.recentlyLearned;

    return response;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✅ ENDPOINT 2: Reset filter (get default list)
  // GET /vocabularies/default
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  @Public()
  @Get('default')
  @ApiOperation({
    summary: 'Get default vocabulary list (reset filter)',
    description: 'Returns all vocabularies sorted by word (A-Z)',
  })
  @ApiOkResponse({ type: [VocabularyResponseDto] })
  async getDefaultVocabularies(): Promise<VocabularyResponseDto[]> {
    const vocabularies = await this.vocabularyService.getDefaultVocabularies();
    return VocabularyResponseDto.fromEntities(vocabularies);
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

  @Public()
  @Get(':id/tts-status')
  @ApiOperation({ summary: 'Check if TTS audio is ready for vocabulary' })
  @ApiOkResponse({
    schema: {
      properties: {
        ready: { type: 'boolean' },
        audioPath: { type: 'string', nullable: true },
      },
    },
  })
  async checkTTSStatus(@Param('id', ParseIntPipe) id: number) {
    return await this.vocabularyService.checkTTSStatus(id);
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

  @Roles(Role.ADMIN)
  @Post('retry-failed-tts')
  @ApiOperation({
    summary: 'Retry TTS generation for vocabularies without audio (Admin only)',
  })
  @ApiOkResponse({
    schema: {
      properties: {
        success: { type: 'number' },
        failed: { type: 'number' },
        message: { type: 'string' },
      },
    },
  })
  async retryFailedTTS() {
    const result = await this.vocabularyService.retryFailedTTS();
    return {
      ...result,
      message: `TTS retry completed: ${result.success} success, ${result.failed} failed`,
    };
  }
}
