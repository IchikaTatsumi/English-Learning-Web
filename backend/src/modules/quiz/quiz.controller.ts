import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Request,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { QuizService } from './quiz.service';
import {
  CreateQuizDto,
  SubmitQuizDto,
  QuizResponseDto,
  QuizResultDto,
  QuizStatisticsDto,
} from './dtos/quiz.dto';

@ApiBearerAuth()
@ApiTags('Quiz')
@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new quiz' })
  @ApiOkResponse({ type: QuizResponseDto })
  async createQuiz(
    @Request() req,
    @Body() dto: CreateQuizDto,
  ): Promise<QuizResponseDto> {
    const userId = parseInt(req.user.id);
    const quiz = await this.quizService.createQuiz(userId, dto);
    return QuizResponseDto.fromEntity(quiz);
  }

  @Get()
  @ApiOperation({ summary: 'Get all quizzes for current user' })
  @ApiOkResponse({ type: [QuizResponseDto] })
  async getUserQuizzes(@Request() req): Promise<QuizResponseDto[]> {
    const userId = parseInt(req.user.id);
    const quizzes = await this.quizService.getUserQuizzes(userId);
    return QuizResponseDto.fromEntities(quizzes);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get quiz statistics for current user' })
  @ApiOkResponse({ type: QuizStatisticsDto })
  async getQuizStatistics(@Request() req): Promise<QuizStatisticsDto> {
    const userId = parseInt(req.user.id);
    const stats = await this.quizService.getQuizStatistics(userId);
    return QuizStatisticsDto.fromEntity(stats);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get quiz by ID' })
  @ApiOkResponse({ type: QuizResponseDto })
  async getQuizById(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ): Promise<QuizResponseDto> {
    const userId = parseInt(req.user.id);
    const quiz = await this.quizService.getQuizById(id, userId);
    return QuizResponseDto.fromEntity(quiz);
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit quiz answers' })
  @ApiOkResponse({ type: QuizResultDto })
  async submitQuiz(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body() dto: SubmitQuizDto,
  ): Promise<QuizResultDto> {
    const userId = parseInt(req.user.id);
    const result = await this.quizService.submitQuiz(id, userId, dto);
    return QuizResultDto.fromEntity(result);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a quiz' })
  async deleteQuiz(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ): Promise<void> {
    const userId = parseInt(req.user.id);
    await this.quizService.deleteQuiz(id, userId);
  }
}
