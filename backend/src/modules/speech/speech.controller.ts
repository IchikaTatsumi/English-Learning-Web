import { Controller, Post, Body, Get } from '@nestjs/common';
import { SpeechClientService } from './speech-client.service';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// ✅ 1. Định nghĩa DTO để thay thế cho `any`
export class RecognizeSpeechDto {
  @ApiProperty({ description: 'Base64 audio string' })
  @IsString()
  @IsNotEmpty()
  audio_base64: string;

  @ApiProperty({ description: 'Target word to recognize' })
  @IsString()
  @IsNotEmpty()
  target_word: string;

  @ApiProperty({ description: 'User ID' })
  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @ApiProperty({ description: 'Vocabulary ID' })
  @IsNumber()
  @IsNotEmpty()
  vocab_id: number;
}

@Controller('speech')
export class SpeechController {
  constructor(private readonly speechClient: SpeechClientService) {}

  @Post('recognize')
  // ✅ 2. Thay `body: any` bằng `dto: RecognizeSpeechDto`
  async recognizeSpeech(@Body() dto: RecognizeSpeechDto) {
    // ✅ 3. Truy cập an toàn vào các thuộc tính của dto
    return await this.speechClient.recognizeSpeech({
      audio_base64: dto.audio_base64, // Đã fix lỗi lặp code (body.audio_base_64 || body.audio_base_64)
      target_word: dto.target_word,
      user_id: dto.user_id,
      vocab_id: dto.vocab_id,
    });
  }

  @Get('health')
  async health() {
    return await this.speechClient.healthCheck();
  }
}
