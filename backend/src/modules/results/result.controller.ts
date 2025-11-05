import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { ResultService } from './result.service';
import { CreateResultDTO, ResultResponseDto } from './dto/result.dto';

@ApiBearerAuth()
@ApiTags('Results')
@Controller('results')
export class ResultController {
  constructor(private readonly resultService: ResultService) {}

  @Get()
  @ApiOperation({ summary: 'Get all results for current user' })
  @ApiOkResponse({ type: [ResultResponseDto] })
  async getUserResults(@Request() req): Promise<ResultResponseDto[]> {
    const userId = parseInt(req.user.id);
    const results = await this.resultService.getResultsByUserId(userId);
    return ResultResponseDto.fromEntities(results);
  }

  @Get('recent')
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOperation({ summary: 'Get recent results' })
  @ApiOkResponse({ type: [ResultResponseDto] })
  async getRecentResults(
    @Request() req,
    @Query('limit') limit?: number,
  ): Promise<ResultResponseDto[]> {
    const userId = parseInt(req.user.id);
    const results = await this.resultService.getRecentResults(
      userId,
      limit || 10,
    );
    return ResultResponseDto.fromEntities(results);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiOkResponse()
  async getUserStatistics(@Request() req) {
    const userId = parseInt(req.user.id);
    return await this.resultService.getUserStatistics(userId);
  }

  @Get('quiz/:quizId')
  @ApiOperation({ summary: 'Get results for specific quiz' })
  @ApiOkResponse({ type: [ResultResponseDto] })
  async getResultsByQuiz(
    @Request() req,
    @Param('quizId', ParseIntPipe) quizId: number,
  ): Promise<ResultResponseDto[]> {
    const userId = parseInt(req.user.id);
    const results = await this.resultService.getResultsByQuizId(quizId, userId);
    return ResultResponseDto.fromEntities(results);
  }

  @Get('vocabulary/:vocabId')
  @ApiOperation({ summary: 'Get results for specific vocabulary' })
  @ApiOkResponse({ type: [ResultResponseDto] })
  async getResultsByVocab(
    @Request() req,
    @Param('vocabId', ParseIntPipe) vocabId: number,
  ): Promise<ResultResponseDto[]> {
    const userId = parseInt(req.user.id);
    const results = await this.resultService.getResultsByVocabId(
      vocabId,
      userId,
    );
    return ResultResponseDto.fromEntities(results);
  }

  @Get('vocabulary/:vocabId/best-score')
  @ApiOperation({ summary: 'Get best score for vocabulary' })
  @ApiOkResponse({ type: Number })
  async getBestScore(
    @Request() req,
    @Param('vocabId', ParseIntPipe) vocabId: number,
  ): Promise<{ score: number }> {
    const userId = parseInt(req.user.id);
    const score = await this.resultService.getBestScoreForVocab(
      vocabId,
      userId,
    );
    return { score };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new result' })
  @ApiOkResponse({ type: ResultResponseDto })
  async createResult(
    @Request() req,
    @Body() dto: CreateResultDTO,
  ): Promise<ResultResponseDto> {
    const userId = parseInt(req.user.id);
    const result = await this.resultService.createResult(userId, dto);
    return ResultResponseDto.fromEntity(result);
  }
}
