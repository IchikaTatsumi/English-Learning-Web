import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SpeechClientService } from './speech-client.service';
import { SpeechController } from './speech.controller';

/**
 * ✅ Speech Module
 *
 * Provides HTTP client to communicate with Python Speech Service:
 * - TTS: Generate audio for vocabulary words
 * - STT: Validate pronunciation
 *
 * Configuration:
 * - SPEECH_SERVICE_URL: Python FastAPI service URL (default: http://localhost:8000)
 */
@Module({
  imports: [ConfigModule],
  controllers: [SpeechController],
  providers: [SpeechClientService],
  exports: [SpeechClientService],
})
export class SpeechModule {}
