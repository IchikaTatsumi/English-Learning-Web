import { Injectable } from '@nestjs/common';
import { VocabularyService } from '../vocabularies/vocabulary.service';
import { ResultService } from '../results/result.service';
import {
  RecognizeSpeechDTO,
  SpeechRecognitionResultDTO,
} from './dto/speech.dto';

@Injectable()
export class SpeechService {
  constructor(
    private vocabularyService: VocabularyService,
    private resultService: ResultService,
  ) {}

  async recognizeSpeech(
    userId: string,
    dto: RecognizeSpeechDTO,
  ): Promise<SpeechRecognitionResultDTO> {
    const vocabulary = await this.vocabularyService.getVocabularyById(
      dto.vocabId,
    );

    // Decode base64 audio data
    // In a real implementation, you would:
    // 1. Save the audio file temporarily
    // 2. Send it to Vosk/Whisper API
    // 3. Get the transcription back
    // For now, we'll simulate this with a placeholder

    const recognizedText = await this.processAudio(dto.audioData);
    const targetWord = vocabulary.word.toLowerCase().trim();
    const recognized = recognizedText.toLowerCase().trim();

    // Calculate similarity score
    const score = this.calculateSimilarityScore(recognized, targetWord);

    // Calculate pronunciation metrics
    const accuracy = this.calculateAccuracy(recognized, targetWord);
    const completeness = this.calculateCompleteness(recognized, targetWord);
    const fluency = score; // Simplified fluency calculation

    // Generate feedback
    const feedback = this.generateFeedback(score, recognized, targetWord);

    // Save result
    await this.resultService.createResult(userId, {
      vocabId: dto.vocabId,
      recognizedText,
      score,
    });

    return {
      recognizedText,
      targetWord: vocabulary.word,
      score,
      feedback,
      pronunciation: {
        accuracy,
        completeness,
        fluency,
      },
    };
  }

  private async processAudio(audioData: string): Promise<string> {
    // TODO: Implement actual speech recognition using Vosk or Whisper
    // This is a placeholder that should be replaced with actual API calls

    // For development, you can use Web Speech API on the client side
    // and send the transcription directly, or integrate with:
    // - Vosk: https://alphacephei.com/vosk/
    // - Whisper: https://github.com/openai/whisper

    return 'placeholder'; // Replace with actual transcription
  }

  private calculateSimilarityScore(recognized: string, target: string): number {
    if (recognized === target) return 100;

    // Levenshtein distance algorithm
    const matrix: number[][] = [];
    const n = recognized.length;
    const m = target.length;

    for (let i = 0; i <= n; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= m; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        if (recognized[i - 1] === target[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1,
          );
        }
      }
    }

    const distance = matrix[n][m];
    const maxLength = Math.max(n, m);
    const similarity = ((maxLength - distance) / maxLength) * 100;

    return Math.round(similarity);
  }

  private calculateAccuracy(recognized: string, target: string): number {
    let correctChars = 0;
    const minLength = Math.min(recognized.length, target.length);

    for (let i = 0; i < minLength; i++) {
      if (recognized[i] === target[i]) {
        correctChars++;
      }
    }

    return Math.round((correctChars / target.length) * 100);
  }

  private calculateCompleteness(recognized: string, target: string): number {
    return Math.round(
      (Math.min(recognized.length, target.length) / target.length) * 100,
    );
  }

  private generateFeedback(
    score: number,
    recognized: string,
    target: string,
  ): string {
    if (score >= 90) {
      return 'Excellent pronunciation! Keep up the great work!';
    } else if (score >= 70) {
      return 'Good effort! Try to pronounce more clearly.';
    } else if (score >= 50) {
      return "You're getting there! Listen to the correct pronunciation and try again.";
    } else {
      return `The correct word is "${target}". Please listen carefully and try again.`;
    }
  }

  async getTextToSpeech(text: string): Promise<Buffer> {
    // TODO: Implement TTS using Web Speech API or external service
    // This should return audio data that can be played on the client
    // For now, return a placeholder
    throw new Error('TTS not implemented - use Web Speech API on client side');
  }
}
