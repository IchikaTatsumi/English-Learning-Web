import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { ConfigService } from '@nestjs/config';

export interface TTSGenerateRequest {
  text: string;
  language: 'en' | 'vi';
  vocab_id: number;
}

export interface TTSGenerateResponse {
  audio_url: string;
  cached?: boolean;
}

@Injectable()
export class SpeechClientService {
  private readonly logger = new Logger(SpeechClientService.name);
  private readonly httpClient: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    const url =
      this.configService.get<string>('SPEECH_SERVICE_URL') ||
      'http://localhost:8000';
    this.httpClient = axios.create({
      baseURL: url,
      timeout: 30000,
    });
  }

  async generateTTS(request: TTSGenerateRequest): Promise<TTSGenerateResponse> {
    try {
      const response = await this.httpClient.post<TTSGenerateResponse>(
        '/tts/generate',
        {
          text: request.text,
          lang: request.language,
          vocab_id: request.vocab_id,
        },
      );
      return response.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown Error';
      this.logger.error(`❌ TTS failed: ${message}`);
      throw new HttpException(
        'TTS Service Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteAudio(vocabId: number, language: string): Promise<void> {
    try {
      await this.httpClient.delete(`/tts/audio/${vocabId}`, {
        params: { language },
      });
    } catch {
      // Không cần dùng biến error nếu không log, tránh lỗi unused variable
      this.logger.warn(`Could not delete audio for ${vocabId}`);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.httpClient.get('/health');
      return true;
    } catch {
      return false;
    }
  }
}
