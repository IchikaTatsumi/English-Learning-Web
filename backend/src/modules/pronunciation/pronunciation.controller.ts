import {
  Controller,
  Post,
  Get,
  Body,
  Request,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { PronunciationService } from './pronunciation.service';
import type { RequestWithUser } from 'src/core/types/request.types';
import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// DTOs
export class PracticePronunciationDto {
  @ApiProperty()
  @IsNumber()
  vocabId: number;

  @ApiProperty({ description: 'Base64 encoded audio' })
  @IsString()
  audioBase64: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  saveRecording?: boolean;
}

@ApiBearerAuth()
@ApiTags('Pronunciation')
@Controller('pronunciation')
export class PronunciationController {
  constructor(private readonly pronunciationService: PronunciationService) {}

  @Post('practice')
  @ApiOperation({ summary: 'Practice pronunciation and get feedback' })
  async practicePronunciation(
    @Request() req: RequestWithUser,
    @Body() dto: PracticePronunciationDto,
  ) {
    return await this.pronunciationService.practicePronunciation(
      req.user.id,
      dto.vocabId,
      dto.audioBase64,
      dto.saveRecording,
    );
  }

  @Get('attempts')
  @ApiOperation({ summary: 'Get user pronunciation attempts' })
  async getUserAttempts(
    @Request() req: RequestWithUser,
    @Query('vocabId', new ParseIntPipe({ optional: true })) vocabId?: number,
  ) {
    return await this.pronunciationService.getUserAttempts(
      req.user.id,
      vocabId,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get pronunciation statistics' })
  async getStats(
    @Request() req: RequestWithUser,
    @Query('vocabId', new ParseIntPipe({ optional: true })) vocabId?: number,
  ) {
    return await this.pronunciationService.getAttemptStats(
      req.user.id,
      vocabId,
    );
  }

  @Get('vocab/:id/attempts')
  @ApiOperation({ summary: 'Get attempts for specific vocabulary' })
  async getVocabAttempts(
    @Request() req: RequestWithUser,
    @Param('id', ParseIntPipe) vocabId: number,
  ) {
    return await this.pronunciationService.getUserAttempts(
      req.user.id,
      vocabId,
    );
  }
}
