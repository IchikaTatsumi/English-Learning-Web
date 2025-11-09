import {
  RecognizeSpeechDto,
  TextToSpeechDto,
  SpeechRecognitionResultDto,
  TextToSpeechResultDto,
  PronunciationTipsDto,
} from '../dtos/speech.dto';

/**
 * Speech Service
 * Maps to backend SpeechController endpoints
 */
export class SpeechService {
  private baseUrl = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:4000/api';

  private getAuthHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  /**
   * Recognize speech and evaluate pronunciation
   * POST /speech/recognize
   * Backend: SpeechController.recognizeSpeech()
   */
  async recognizeSpeech(dto: RecognizeSpeechDto): Promise<SpeechRecognitionResultDto> {
    try {
      const response = await fetch(`${this.baseUrl}/speech/recognize`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(dto),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to recognize speech');
      }

      return await response.json();
    } catch (error) {
      console.error('Error recognizing speech:', error);
      throw error;
    }
  }

  /**
   * Convert text to speech
   * POST /speech/text-to-speech
   * Backend: SpeechController.textToSpeech()
   */
  async textToSpeech(dto: TextToSpeechDto): Promise<TextToSpeechResultDto> {
    try {
      const response = await fetch(`${this.baseUrl}/speech/text-to-speech`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(dto),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to convert text to speech');
      }

      return await response.json();
    } catch (error) {
      console.error('Error converting text to speech:', error);
      throw error;
    }
  }

  /**
   * Get pronunciation assessment tips
   * GET /speech/pronunciation-assessment
   * Backend: SpeechController.getPronunciationTips()
   */
  async getPronunciationTips(): Promise<PronunciationTipsDto> {
    try {
      const response = await fetch(`${this.baseUrl}/speech/pronunciation-assessment`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to get pronunciation tips');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching pronunciation tips:', error);
      throw error;
    }
  }

  /**
   * Client-side helper: Record audio using Web Audio API
   */
  async recordAudio(durationMs: number = 3000): Promise<string> {
    return new Promise((resolve, reject) => {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          const mediaRecorder = new MediaRecorder(stream);
          const audioChunks: Blob[] = [];

          mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
          };

          mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = () => {
              const base64Audio = reader.result as string;
              // Remove data:audio/wav;base64, prefix
              const base64Data = base64Audio.split(',')[1];
              resolve(base64Data);
            };
          };

          mediaRecorder.start();

          setTimeout(() => {
            mediaRecorder.stop();
            stream.getTracks().forEach(track => track.stop());
          }, durationMs);
        })
        .catch(reject);
    });
  }

  /**
   * Client-side helper: Play audio from base64
   */
  async playAudio(base64Audio: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(`data:audio/wav;base64,${base64Audio}`);
      audio.onended = () => resolve();
      audio.onerror = reject;
      audio.play().catch(reject);
    });
  }
}

export const speechService = new SpeechService();