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
} from '@nestjs/swagger';
import { VocabularyService } from './vocabulary.service';
import {
  CreateVocabularyDTO,
  UpdateVocabularyDTO,
  VocabularyResponseDto,
  VocabularyWithProgressDto,
} from './dto/vocabulary.dto';
import { Role } from 'src/core/enums/role.enum';
import { Roles } from 'src/core/decorators/role.decorator';
import { Public } from 'src/core/decorators/public.decorator';

interface RequestWithUser {
  user: {
    id: number;
  };
}

// ✅ FIX: Thêm interface cho VocabularyWithProgress
interface VocabularyWithProgress {
  id: number;
  word: string;
  meaningEn: string;
  meaningVi: string;
  ipa: string;
  difficultyLevel: string;
  isLearned: boolean;
  bestScore: number;
  lastReviewed: Date | null;
  attemptCount: number;
  topic?: {
    id: number;
    topicName: string;
  };
}

@ApiBearerAuth()
@ApiTags('Vocabulary')
@Controller('vocabularies')
export class VocabularyController {
  constructor(private readonly vocabularyService: VocabularyService) {}

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
  ): Promise<VocabularyWithProgress[]> {
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
