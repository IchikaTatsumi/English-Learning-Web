import { Controller, Post, Body, Request, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { SpeechService } from './speech.service';
import {
  RecognizeSpeechDTO,
  TextToSpeechDTO,
  SpeechRecognitionResultDTO,
  TextToSpeechResultDTO,
} from './dto/speech.dto';

@ApiBearerAuth()
@ApiTags('Speech')
@Controller('speech')
export class SpeechController {
  constructor(private readonly speechService: SpeechService) {}

  @Post('recognize')
  @ApiOperation({
    summary: 'Recognize speech and evaluate pronunciation',
  })
  @ApiOkResponse({ type: SpeechRecognitionResultDTO })
  async recognizeSpeech(
    @Request() req,
    @Body() dto: RecognizeSpeechDTO,
  ): Promise<SpeechRecognitionResultDTO> {
    const userId = req.user.id.toString();
    const result = await this.speechService.recognizeSpeech(userId, dto);
    return SpeechRecognitionResultDTO.fromEntity(result);
  }

  @Post('text-to-speech')
  @ApiOperation({
    summary: 'Convert text to speech',
  })
  @ApiOkResponse({ type: TextToSpeechResultDTO })
  async textToSpeech(
    @Body() dto: TextToSpeechDTO,
  ): Promise<TextToSpeechResultDTO> {
    const audioBuffer = await this.speechService.getTextToSpeech(dto.text);
    const audioBase64 = audioBuffer.toString('base64');
    return TextToSpeechResultDTO.fromEntity({
      audioBase64,
      duration: 0,
    });
  }

  @Get('pronunciation-assessment')
  @ApiOperation({
    summary: 'Get pronunciation assessment tips',
  })
  async getPronunciationTips(): Promise<{
    tips: string[];
  }> {
    return {
      tips: [
        'Speak clearly and at a moderate pace',
        'Practice the pronunciation multiple times',
        'Listen to the correct pronunciation first',
        'Record yourself and compare with the target',
        'Focus on individual sounds and syllables',
      ],
    };
  }
}
