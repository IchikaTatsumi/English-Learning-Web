import {
  Controller,
  Post,
  Body,
  Get,
  Request,
  HttpException,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOkResponse,
  ApiOperation,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
// ✅ Import thêm VoiceInfo
import { SpeechClientService, VoiceInfo } from './speech-client.service';
import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { RequestWithUser } from 'src/core/types/request.types';
import { Public } from 'src/core/decorators/public.decorator';

// DTO cho Form Data (File Upload)
class RecognizeSpeechFormDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;

  @ApiProperty()
  targetWord: string;

  @ApiProperty()
  vocabId: number;
}

export class GenerateTTSDto {
  @ApiProperty({ description: 'Text to synthesize' })
  @IsString()
  text!: string;

  @ApiProperty({ enum: ['en', 'vi'], default: 'en' })
  @IsString()
  language!: 'en' | 'vi';

  @ApiProperty({ description: 'Vocabulary ID' })
  @IsNumber()
  vocabId!: number;
}

// Response DTO mapping với interface từ service
export class VoicesResponseDto {
  @ApiProperty({ type: 'array', items: { type: 'object' } })
  voices!: VoiceInfo[];
}

@ApiBearerAuth()
@ApiTags('Speech')
@Controller('speech')
export class SpeechController {
  constructor(private readonly speechClient: SpeechClientService) {}

  /**
   * ✅ RECOGNIZE SPEECH (Updated to handle File Upload)
   */
  @Post('recognize')
  @ApiOperation({ summary: 'Recognize speech from audio file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: RecognizeSpeechFormDto })
  @UseInterceptors(FileInterceptor('file'))
  async recognizeSpeech(
    @Request() req: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
    @Body('targetWord') targetWord: string,
    @Body('vocabId') vocabId: string,
  ) {
    if (!file) {
      throw new BadRequestException('Audio file is required');
    }

    try {
      const userId = req.user.id;
      const audioBase64 = file.buffer.toString('base64');

      const result = await this.speechClient.recognizeSpeech({
        audio_base64: audioBase64,
        target_word: targetWord,
        user_id: userId,
        vocab_id: parseInt(vocabId),
        save_recording: true,
      });

      return {
        recognizedText: result.recognized_text,
        targetWord: result.target_word,
        isCorrect: result.is_correct,
        confidence: result.confidence,
      };
    } catch (error) {
      console.error(error);
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
  @ApiOperation({ summary: 'Generate TTS audio for vocabulary' })
  async generateTTS(@Body() dto: GenerateTTSDto) {
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
      throw new HttpException(
        'TTS generation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Public()
  @Get('health')
  async healthCheck() {
    const isHealthy = await this.speechClient.healthCheck();
    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      service: 'Speech Service',
    };
  }

  @Public()
  @Get('voices')
  @ApiOperation({ summary: 'Get available TTS voices' })
  @ApiOkResponse({ type: VoicesResponseDto })
  // ✅ [FIXED] Định nghĩa rõ kiểu trả về Promise<{ voices: VoiceInfo[] }> để build production
  async getVoices(): Promise<{ voices: VoiceInfo[] }> {
    const voices = await this.speechClient.getAvailableVoices();
    return { voices };
  }
}
