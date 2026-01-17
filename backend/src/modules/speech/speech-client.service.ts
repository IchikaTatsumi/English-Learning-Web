import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { ConfigService } from '@nestjs/config';

export interface STTRecognizeRequest {
  audio_base64: string;
  target_word: string;
  user_id: number;
  vocab_id: number;
}

export interface STTRecognizeResponse {
  recognized_text: string;
  is_correct: boolean;
  confidence: number;
}

@Injectable()
export class SpeechClientService {
  private readonly logger = new Logger(SpeechClientService.name);
  private readonly httpClient: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    const url =
      this.configService.get<string>('SPEECH_SERVICE_URL') ||
      'http://speech-service:8000';
    this.httpClient = axios.create({ baseURL: url, timeout: 30000 });
  }

  async recognizeSpeech(
    request: STTRecognizeRequest,
  ): Promise<STTRecognizeResponse> {
    try {
      const response = await this.httpClient.post<STTRecognizeResponse>(
        '/stt/recognize-base64',
        request,
      );
      return response.data;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown STT Error';
      this.logger.error(`❌ STT failed: ${msg}`);
      throw new HttpException(
        `Speech recognition failed: ${msg}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.httpClient.get('/health');
      return response.status === 200;
    } catch {
      return false;
    }
  }
}
