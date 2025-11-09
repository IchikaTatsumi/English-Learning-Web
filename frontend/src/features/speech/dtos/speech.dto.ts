export interface RecognizeSpeechDto {
  vocab_id: number;
  audio_data: string; // Base64 encoded audio
}

export interface TextToSpeechDto {
  text: string;
  lang?: string;
}

// ============================================
// RESPONSE DTOs
// ============================================

export interface PronunciationMetricsDto {
  accuracy: number;
  completeness: number;
  fluency: number;
  prosody?: number;
}

export interface SpeechRecognitionResultDto {
  recognized_text: string;
  target_word: string;
  score: number;
  feedback: string;
  pronunciation: PronunciationMetricsDto;
  audio_path?: string;
}

export interface TextToSpeechResultDto {
  audio_base64: string;
  audio_path?: string;
  duration?: number;
}

export interface PronunciationTipsDto {
  tips: string[];
}