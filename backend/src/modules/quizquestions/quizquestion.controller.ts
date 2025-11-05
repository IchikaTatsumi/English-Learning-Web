import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { QuizQuestionService } from './quizquestion.service';
import {
  CreateQuizQuestionDto,
  QuizQuestionResponseDto,
} from './dto/quizquestion.dto';
import { Roles } from 'src/core/decorators/role.decorator';
import { Role } from 'src/core/enums/role.enum';
import { Public } from 'src/core/decorators/public.decorator';

@ApiBearerAuth()
@ApiTags('Quiz Questions')
@Controller('quiz-questions')
export class QuizQuestionController {
  constructor(private readonly quizQuestionService: QuizQuestionService) {}

  @Public()
  @Get('random')
  @ApiQuery({ name: 'count', required: false, type: Number })
  @ApiOperation({ summary: 'Get random questions for practice' })
  @ApiOkResponse({ type: [QuizQuestionResponseDto] })
  async getRandomQuestions(
    @Query('count') count?: number,
  ): Promise<QuizQuestionResponseDto[]> {
    const questions = await this.quizQuestionService.getRandomQuestions(
      count || 10,
    );
    return QuizQuestionResponseDto.fromEntities(questions);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get question by ID' })
  @ApiOkResponse({ type: QuizQuestionResponseDto })
  async getQuestionById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<QuizQuestionResponseDto> {
    const question = await this.quizQuestionService.getQuestionById(id);
    return QuizQuestionResponseDto.fromEntity(question);
  }

  @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a new question (Admin only)' })
  @ApiOkResponse({ type: QuizQuestionResponseDto })
  async createQuestion(
    @Body() dto: CreateQuizQuestionDto,
  ): Promise<QuizQuestionResponseDto> {
    const question = await this.quizQuestionService.createQuestion(dto);
    return QuizQuestionResponseDto.fromEntity(question);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a question (Admin only)' })
  async deleteQuestion(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.quizQuestionService.deleteQuestion(id);
  }
}
