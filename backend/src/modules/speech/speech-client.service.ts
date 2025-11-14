import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { ConfigService } from '@nestjs/config';

// ✅ DTOs for Speech Service communication
export interface TTSGenerateRequest {
  text: string;
  language: 'en' | 'vi';
  vocab_id: number;
  voice?: string;
}

export interface TTSGenerateResponse {
  audio_url: string;
  duration: number;
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

export interface PronunciationScore {
  accuracy: number;
  fluency: number;
  completeness: number;
}

export interface STTRecognizeResponse {
  recognized_text: string;
  target_word: string;
  is_correct: boolean;
  confidence: number;
  accuracy: number;
  pronunciation_score?: PronunciationScore;
  audio_url?: string;
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
      timeout: 30000, // 30 seconds
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
   * Calls Python Speech Service to generate audio and upload to MinIO
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
        `✅ TTS generated successfully: ${response.data.audio_url} (cached: ${response.data.cached})`,
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        `❌ TTS generation failed: ${error.response?.data?.detail || error.message}`,
      );
      throw new HttpException(
        `TTS generation failed: ${error.response?.data?.detail || error.message}`,
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * ✅ Recognize speech and compare with target word
   * Accepts base64 audio and returns recognition result
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
        `✅ Speech recognized: "${response.data.recognized_text}" ` +
          `(correct: ${response.data.is_correct}, ` +
          `confidence: ${response.data.confidence.toFixed(2)})`,
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        `❌ Speech recognition failed: ${error.response?.data?.detail || error.message}`,
      );
      throw new HttpException(
        `Speech recognition failed: ${error.response?.data?.detail || error.message}`,
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * ✅ Get available TTS voices
   */
  async getAvailableVoices(language?: 'en' | 'vi'): Promise<any[]> {
    try {
      const response = await this.httpClient.get('/tts/voices', {
        params: language ? { language } : undefined,
      });

      return response.data.voices || [];
    } catch (error) {
      this.logger.error(
        `❌ Failed to get voices: ${error.response?.data?.detail || error.message}`,
      );
      return [];
    }
  }

  /**
   * ✅ Delete audio file (cleanup)
   */
  async deleteAudio(vocabId: number, language: 'en' | 'vi'): Promise<void> {
    try {
      await this.httpClient.delete(`/tts/audio/${vocabId}`, {
        params: { language },
      });

      this.logger.log(`🗑️ Audio deleted for vocab ${vocabId}`);
    } catch (error) {
      this.logger.warn(
        `⚠️ Failed to delete audio: ${error.response?.data?.detail || error.message}`,
      );
      // Don't throw error, just log warning
    }
  }

  /**
   * ✅ Health check for Speech Service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.httpClient.get('/health');
      return response.status === 200 && response.data.status === 'healthy';
    } catch (error) {
      this.logger.error(
        `❌ Speech Service health check failed: ${error.message}`,
      );
      return false;
    }
  }
}
