import { Controller, Get, Request } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { ProgressResponseDto, ProgressStatsDTO } from './dto/progress.dto';

@ApiBearerAuth()
@ApiTags('Progress')
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get()
  @ApiOperation({ summary: 'Get user progress' })
  @ApiOkResponse({ type: ProgressResponseDto })
  async getUserProgress(@Request() req): Promise<ProgressResponseDto> {
    const userId = parseInt(req.user.id);
    const progress = await this.progressService.getOrCreateProgress(userId);
    return ProgressResponseDto.fromEntity(progress);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get detailed progress statistics' })
  @ApiOkResponse({ type: ProgressStatsDTO })
  async getProgressStats(@Request() req): Promise<ProgressStatsDTO> {
    const userId = parseInt(req.user.id);
    const stats = await this.progressService.getProgressStats(userId);
    return ProgressStatsDTO.fromEntity(stats);
  }
}
