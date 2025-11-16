import {
  Controller,
  Post,
  Body,
  Get,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { SpeechClientService } from './speech-client.service';
import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { RequestWithUser } from 'src/core/types/request.types';
import { Public } from 'src/core/decorators/public.decorator';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ REQUEST DTOs
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class RecognizeSpeechDto {
  @ApiProperty({
    description: 'Base64 encoded audio data',
    example: 'UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
  })
  @IsString()
  audioBase64!: string;

  @ApiProperty({
    description: 'Target word to compare pronunciation',
    example: 'hello',
  })
  @IsString()
  targetWord!: string;

  @ApiProperty({
    description: 'Vocabulary ID',
    example: 1,
  })
  @IsNumber()
  vocabId!: number;

  @ApiProperty({
    description: 'Save recording to MinIO',
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  saveRecording?: boolean;
}

export class GenerateTTSDto {
  @ApiProperty({ description: 'Text to synthesize', example: 'Hello world' })
  @IsString()
  text!: string;

  @ApiProperty({
    description: 'Language code',
    enum: ['en', 'vi'],
    default: 'en',
  })
  @IsString()
  language!: 'en' | 'vi';

  @ApiProperty({ description: 'Vocabulary ID', example: 1 })
  @IsNumber()
  vocabId!: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ RESPONSE DTOs
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class RecognizeSpeechResponseDto {
  @ApiProperty()
  recognizedText!: string;

  @ApiProperty()
  targetWord!: string;

  @ApiProperty()
  isCorrect!: boolean;

  @ApiProperty()
  confidence!: number;
}

export class GenerateTTSResponseDto {
  @ApiProperty()
  audioUrl!: string;

  @ApiProperty({ required: false })
  duration?: number;

  @ApiProperty({ required: false })
  cached?: boolean;
}

export class HealthCheckResponseDto {
  @ApiProperty()
  status!: string;

  @ApiProperty()
  service!: string;
}

export class VoicesResponseDto {
  @ApiProperty({ type: 'array', items: { type: 'object' } })
  voices!: Array<{
    code: string;
    name: string;
    language: string;
  }>;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ CONTROLLER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@ApiBearerAuth()
@ApiTags('Speech')
@Controller('speech')
export class SpeechController {
  constructor(private readonly speechClient: SpeechClientService) {}

  /**
   * ✅ RECOGNIZE SPEECH (STT)
   */
  @Post('recognize')
  @ApiOperation({
    summary: 'Recognize speech and compare with target word',
    description: 'Send base64 encoded audio to recognize pronunciation',
  })
  @ApiOkResponse({ type: RecognizeSpeechResponseDto })
  async recognizeSpeech(
    @Request() req: RequestWithUser,
    @Body() dto: RecognizeSpeechDto,
  ): Promise<RecognizeSpeechResponseDto> {
    try {
      const userId = req.user.id;

      const result = await this.speechClient.recognizeSpeech({
        audio_base64: dto.audioBase64,
        target_word: dto.targetWord,
        user_id: userId,
        vocab_id: dto.vocabId,
        save_recording: dto.saveRecording || false,
      });

      return {
        recognizedText: result.recognized_text,
        targetWord: result.target_word,
        isCorrect: result.is_correct,
        confidence: result.confidence,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Speech recognition failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * ✅ GENERATE TTS
   */
  @Post('generate-tts')
  @ApiOperation({
    summary: 'Generate TTS audio for vocabulary',
    description: 'Manually trigger TTS generation',
  })
  @ApiOkResponse({ type: GenerateTTSResponseDto })
  async generateTTS(
    @Body() dto: GenerateTTSDto,
  ): Promise<GenerateTTSResponseDto> {
    try {
      const result = await this.speechClient.generateTTS({
        text: dto.text,
        language: dto.language,
        vocab_id: dto.vocabId,
      });

      return {
        audioUrl: result.audio_url,
        duration: result.duration,
        cached: result.cached,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'TTS generation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * ✅ HEALTH CHECK
   */
  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Health check for Speech Service' })
  @ApiOkResponse({ type: HealthCheckResponseDto })
  async healthCheck(): Promise<HealthCheckResponseDto> {
    const isHealthy = await this.speechClient.healthCheck();
    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      service: 'Speech Service',
    };
  }

  /**
   * ✅ GET AVAILABLE VOICES
   */
  @Public()
  @Get('voices')
  @ApiOperation({ summary: 'Get available TTS voices' })
  @ApiOkResponse({ type: VoicesResponseDto })
  async getVoices(): Promise<VoicesResponseDto> {
    const voices = await this.speechClient.getAvailableVoices();
    return { voices };
  }
}
