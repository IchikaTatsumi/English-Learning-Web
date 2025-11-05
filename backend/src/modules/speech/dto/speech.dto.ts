import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AutoExpose } from 'src/core/decorators/auto-expose.decorator';
import { BaseResponseDto } from 'src/core/dto/base.dto';

export class RecognizeSpeechDTO {
  @ApiProperty({ description: 'Vocabulary ID to check pronunciation' })
  @IsNumber()
  @IsNotEmpty()
  vocabId: number;

  @ApiProperty({ description: 'Base64 encoded audio data' })
  @IsString()
  @IsNotEmpty()
  audioData: string;
}

export class TextToSpeechDTO {
  @ApiProperty({ description: 'Text to convert to speech' })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty({ description: 'Language code (en, vi)', required: false })
  @IsString()
  lang?: string;
}

@AutoExpose()
export class PronunciationMetricsDTO extends BaseResponseDto {
  accuracy: number;
  completeness: number;
  fluency: number;
  prosody?: number; // ✅ FIX: Thêm optional property
}

@AutoExpose()
export class SpeechRecognitionResultDTO extends BaseResponseDto {
  recognizedText: string;
  targetWord: string;
  score: number;
  feedback: string;
  pronunciation: PronunciationMetricsDTO;
  audioPath?: string;
}

@AutoExpose()
export class TextToSpeechResultDTO extends BaseResponseDto {
  audioBase64: string;
  audioPath?: string;
  duration?: number;
}
