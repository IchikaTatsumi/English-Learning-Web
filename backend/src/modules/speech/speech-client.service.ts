import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import axios, { AxiosInstance, AxiosError } from 'axios';
import { ConfigService } from '@nestjs/config';

// ✅ DTOs with proper typing
export interface TTSGenerateRequest {
  text: string;
  language: 'en' | 'vi';
  vocab_id: number;
  voice?: string;
}

export interface TTSGenerateResponse {
  audio_url: string;
  duration?: number;
  file_size?: number;
  voice_used?: string;
  cached?: boolean;
}

export interface STTRecognizeRequest {
  audio_base64: string;
  target_word: string;
  user_id: number;
  vocab_id: number;
  save_recording?: boolean;
}

export interface STTRecognizeResponse {
  recognized_text: string;
  target_word: string;
  is_correct: boolean;
  confidence: number;
}

// ✅ [FIXED] Thêm export để tránh lỗi TS4053 khi build
export interface VoiceInfo {
  code: string;
  name: string;
  language: string;
}

export interface VoicesResponse {
  voices: VoiceInfo[];
}

@Injectable()
export class SpeechClientService {
  private readonly logger = new Logger(SpeechClientService.name);
  private readonly httpClient: AxiosInstance;
  private readonly speechServiceUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.speechServiceUrl =
      this.configService.get<string>('SPEECH_SERVICE_URL') ||
      'http://localhost:8000';

    this.httpClient = axios.create({
      baseURL: this.speechServiceUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.logger.log(
      `✅ Speech Service Client initialized: ${this.speechServiceUrl}`,
    );
  }

  /**
   * ✅ Generate TTS audio for vocabulary
   */
  async generateTTS(request: TTSGenerateRequest): Promise<TTSGenerateResponse> {
    try {
      this.logger.log(
        `🔊 Generating TTS for vocab ${request.vocab_id}: "${request.text}"`,
      );

      const response = await this.httpClient.post<TTSGenerateResponse>(
        '/tts/generate',
        {
          text: request.text,
          lang: request.language,
          vocab_id: request.vocab_id,
          slow: false,
        },
      );

      this.logger.log(
        `✅ TTS generated: ${response.data.audio_url} (cached: ${response.data.cached || false})`,
      );

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: string }>;
      const errorMessage =
        axiosError.response?.data?.detail ||
        axiosError.message ||
        'Unknown error';
      const statusCode =
        axiosError.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;

      this.logger.error(`❌ TTS failed: ${errorMessage}`);

      throw new HttpException(
        `TTS generation failed: ${errorMessage}`,
        statusCode,
      );
    }
  }

  /**
   * ✅ Recognize speech and compare text
   */
  async recognizeSpeech(
    request: STTRecognizeRequest,
  ): Promise<STTRecognizeResponse> {
    try {
      this.logger.log(
        `🎤 Recognizing speech for vocab ${request.vocab_id}, target: "${request.target_word}"`,
      );

      const response = await this.httpClient.post<STTRecognizeResponse>(
        '/stt/recognize-base64',
        request,
      );

      this.logger.log(
        `✅ STT result: "${response.data.recognized_text}" ` +
          `(correct: ${response.data.is_correct}, ` +
          `confidence: ${response.data.confidence.toFixed(2)})`,
      );

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: string }>;
      const errorMessage =
        axiosError.response?.data?.detail ||
        axiosError.message ||
        'Unknown error';
      const statusCode =
        axiosError.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;

      this.logger.error(`❌ STT failed: ${errorMessage}`);

      throw new HttpException(
        `Speech recognition failed: ${errorMessage}`,
        statusCode,
      );
    }
  }

  /**
   * ✅ Get available TTS voices
   */
  async getAvailableVoices(language?: 'en' | 'vi'): Promise<VoiceInfo[]> {
    try {
      const response = await this.httpClient.get<VoicesResponse>(
        '/tts/voices',
        {
          params: language ? { language } : undefined,
        },
      );

      return response.data.voices || [];
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: string }>;
      const errorMessage =
        axiosError.response?.data?.detail ||
        axiosError.message ||
        'Unknown error';

      this.logger.error(`❌ Failed to get voices: ${errorMessage}`);
      return [];
    }
  }

  /**
   * ✅ Delete audio file
   */
  async deleteAudio(vocabId: number, language: 'en' | 'vi'): Promise<void> {
    try {
      await this.httpClient.delete(`/tts/audio/${vocabId}`, {
        params: { language },
      });

      this.logger.log(`🗑️ Audio deleted for vocab ${vocabId}`);
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: string }>;
      const errorMessage =
        axiosError.response?.data?.detail ||
        axiosError.message ||
        'Unknown error';

      this.logger.warn(`⚠️ Failed to delete audio: ${errorMessage}`);
    }
  }

  /**
   * ✅ Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.httpClient.get<{ status: string }>('/health');
      return response.status === 200 && response.data.status === 'healthy';
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(
        `❌ Speech Service health check failed: ${axiosError.message}`,
      );
      return false;
    }
  }
}
