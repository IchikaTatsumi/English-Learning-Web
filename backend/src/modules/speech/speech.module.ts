import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SpeechClientService } from './speech-client.service';

/**
 * Speech Module
 * 
 * Provides HTTP client to communicate with Python Speech Service
 * - TTS: Generate audio for vocabulary words
 * - STT: Validate pronunciation
 */
@Module({
  imports: [ConfigModule],
  providers: [SpeechClientService],
  exports: [SpeechClientService],
})
export class SpeechModule {}