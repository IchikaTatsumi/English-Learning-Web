import {
  Controller,
  Post,
  Body,
  Get,
  Request,
  Param,
  ParseIntPipe,
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
  audioBase64: string;

  @ApiProperty({
    description: 'Target word to compare pronunciation',
    example: 'hello',
  })
  @IsString()
  targetWord: string;

  @ApiProperty({
    description: 'Vocabulary ID',
    example: 1,
  })
  @IsNumber()
  vocabId: number;

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
  text: string;

  @ApiProperty({
    description: 'Language code',
    enum: ['en', 'vi'],
    default: 'en',
  })
  @IsString()
  language: 'en' | 'vi';

  @ApiProperty({ description: 'Vocabulary ID', example: 1 })
  @IsNumber()
  vocabId: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ RESPONSE DTOs
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class PronunciationScoreDto {
  @ApiProperty()
  accuracy: number;

  @ApiProperty()
  fluency: number;

  @ApiProperty()
  completeness: number;
}

export class RecognizeSpeechResponseDto {
  @ApiProperty()
  recognizedText: string;

  @ApiProperty()
  targetWord: string;

  @ApiProperty()
  isCorrect: boolean;

  @ApiProperty()
  confidence: number;

  @ApiProperty()
  accuracy: number;

  @ApiProperty({ required: false })
  pronunciationScore?: PronunciationScoreDto;

  @ApiProperty({ required: false })
  audioUrl?: string;
}

export class GenerateTTSResponseDto {
  @ApiProperty()
  audioUrl: string;

  @ApiProperty()
  duration: number;

  @ApiProperty({ required: false })
  cached?: boolean;
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
   * Accepts base64 audio and returns recognition result
   */
  @Post('recognize')
  @ApiOperation({
    summary: 'Recognize speech and compare with target word',
    description: `
      Send base64 encoded audio to recognize pronunciation.
      Returns:
      - Recognized text
      - Correctness comparison
      - Confidence score
      - Pronunciation scores (accuracy, fluency, completeness)
    `,
  })
  @ApiOkResponse({ type: RecognizeSpeechResponseDto })
  async recognizeSpeech(
    @Request() req: RequestWithUser,
    @Body() dto: RecognizeSpeechDto,
  ): Promise<RecognizeSpeechResponseDto> {
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
      accuracy: result.accuracy,
      pronunciationScore: result.pronunciation_score,
      audioUrl: result.audio_url,
    };
  }

  /**
   * ✅ GENERATE TTS
   * Generate audio for vocabulary (manual trigger if needed)
   */
  @Post('generate-tts')
  @ApiOperation({
    summary: 'Generate TTS audio for vocabulary',
    description:
      'Manually trigger TTS generation (usually done automatically on vocab creation)',
  })
  @ApiOkResponse({ type: GenerateTTSResponseDto })
  async generateTTS(
    @Body() dto: GenerateTTSDto,
  ): Promise<GenerateTTSResponseDto> {
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
  }

  /**
   * ✅ CHECK TTS STATUS
   * Check if TTS audio is ready for vocabulary
   */
  @Public()
  @Get('tts-status/:vocabId')
  @ApiOperation({
    summary: 'Check if TTS audio is ready',
    description:
      'Frontend can poll this to check if audio generation is complete',
  })
  @ApiOkResponse({
    schema: {
      properties: {
        ready: { type: 'boolean' },
        audioPath: { type: 'string', nullable: true },
      },
    },
  })
  async checkTTSStatus(@Param('vocabId', ParseIntPipe) vocabId: number) {
    // This will be implemented in vocabulary.service.ts
    return { ready: true, audioPath: null };
  }

  /**
   * ✅ HEALTH CHECK
   * Check if Speech Service is available
   */
  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Health check for Speech Service' })
  async healthCheck() {
    const isHealthy = await this.speechClient.healthCheck();
    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      service: 'Speech Service',
    };
  }

  /**
   * ✅ GET AVAILABLE VOICES
   * List available TTS voices
   */
  @Public()
  @Get('voices')
  @ApiOperation({ summary: 'Get available TTS voices' })
  async getVoices() {
    const voices = await this.speechClient.getAvailableVoices();
    return { voices };
  }
}
