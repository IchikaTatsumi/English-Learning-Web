import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { VocabularyProgressService } from './vocabulary-progress.service';
import {
  SubmitPracticeDto,
  BookmarkVocabDto,
  VocabularyProgressResponseDto,
} from './dto/vocabulary-practice.dto';
import type { RequestWithUser } from 'src/core/types/request.types';

@ApiBearerAuth()
@ApiTags('Vocabulary Practice')
@Controller('vocabulary-practice')
export class VocabularyPracticeController {
  constructor(private readonly progressService: VocabularyProgressService) {}

  @Post('submit')
  @ApiOperation({ summary: 'Submit practice answers for a vocabulary' })
  @ApiOkResponse({ type: VocabularyProgressResponseDto })
  async submitPractice(
    @Request() req: RequestWithUser,
    @Body() dto: SubmitPracticeDto,
  ) {
    const userId = req.user.id;
    const progress = await this.progressService.submitPractice(userId, dto);
    return await this.progressService.getProgressStats(
      userId,
      progress.vocabId,
    );
  }

  @Post('bookmark')
  @ApiOperation({ summary: 'Toggle bookmark status for a vocabulary' })
  @ApiOkResponse({ type: VocabularyProgressResponseDto })
  async toggleBookmark(
    @Request() req: RequestWithUser,
    @Body() dto: BookmarkVocabDto,
  ) {
    const userId = req.user.id;
    const progress = await this.progressService.toggleBookmark(userId, dto);
    return await this.progressService.getProgressStats(
      userId,
      progress.vocabId,
    );
  }

  @Get('learned')
  @ApiOperation({ summary: 'Get all learned vocabularies' })
  async getLearnedVocabularies(@Request() req: RequestWithUser) {
    const userId = req.user.id;
    return await this.progressService.getLearnedVocabularies(userId);
  }

  @Get('bookmarked')
  @ApiOperation({ summary: 'Get all bookmarked vocabularies' })
  async getBookmarkedVocabularies(@Request() req: RequestWithUser) {
    const userId = req.user.id;
    return await this.progressService.getBookmarkedVocabularies(userId);
  }

  @Get(':vocabId/stats')
  @ApiOperation({ summary: 'Get progress stats for a specific vocabulary' })
  @ApiOkResponse({ type: VocabularyProgressResponseDto })
  async getProgressStats(
    @Request() req: RequestWithUser,
    @Param('vocabId', ParseIntPipe) vocabId: number,
  ) {
    const userId = req.user.id;
    return await this.progressService.getProgressStats(userId, vocabId);
  }
}
