import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PronunciationAttempt } from './entities/pronunciation-attempt.entity';
import { SpeechClientService } from '../speech/speech-client.service';
import { VocabularyService } from '../vocabularies/vocabulary.service';
import { VocabularyProgressService } from '../vocabularyprogress/vocabulary-progress.service';

@Injectable()
export class PronunciationService {
  constructor(
    @InjectRepository(PronunciationAttempt)
    private attemptRepository: Repository<PronunciationAttempt>,
    private speechClient: SpeechClientService,
    private vocabularyService: VocabularyService,
    private progressService: VocabularyProgressService,
  ) {}

  async practicePronunciation(
    userId: number,
    vocabId: number,
    audioBase64: string,
    saveRecording = false,
  ) {
    // 1. Get vocabulary
    const vocab = await this.vocabularyService.getVocabularyById(vocabId);

    if (!vocab) {
      throw new NotFoundException(`Vocabulary ${vocabId} not found`);
    }

    // 2. Recognize speech
    const result = await this.speechClient.recognizeSpeech({
      audio_base64: audioBase64,
      target_word: vocab.word,
      user_id: userId,
      vocab_id: vocabId,
      save_recording: saveRecording,
    });

    // 3. Save attempt
    const attempt = this.attemptRepository.create({
      userId,
      vocabId,
      recognizedText: result.recognized_text,
      targetWord: result.target_word,
      isCorrect: result.is_correct,
      confidence: result.confidence,
      accuracy: result.accuracy,
      pronunciationScore: result.pronunciation_score || null,
      audioUrl: result.audio_url || null,
    });

    await this.attemptRepository.save(attempt);

    // 4. Update vocabulary progress
    await this.progressService.submitPractice(userId, {
      vocabId,
      answers: [
        {
          questionId: vocabId, // Dummy question ID
          questionType: 'Pronunciation',
          questionText: `Pronounce: ${vocab.word}`,
          correctAnswer: vocab.word,
          userAnswer: result.recognized_text,
          isCorrect: result.is_correct,
        },
      ],
    });

    return {
      attempt,
      result,
    };
  }

  async getUserAttempts(userId: number, vocabId?: number) {
    const query = this.attemptRepository
      .createQueryBuilder('attempt')
      .where('attempt.userId = :userId', { userId })
      .leftJoinAndSelect('attempt.vocabulary', 'vocab')
      .orderBy('attempt.createdAt', 'DESC');

    if (vocabId) {
      query.andWhere('attempt.vocabId = :vocabId', { vocabId });
    }

    return await query.getMany();
  }

  async getAttemptStats(userId: number, vocabId?: number) {
    const attempts = await this.getUserAttempts(userId, vocabId);

    const total = attempts.length;
    const correct = attempts.filter((a) => a.isCorrect).length;
    const avgConfidence =
      total > 0
        ? attempts.reduce((sum, a) => sum + a.confidence, 0) / total
        : 0;
    const avgAccuracy =
      total > 0 ? attempts.reduce((sum, a) => sum + a.accuracy, 0) / total : 0;

    return {
      totalAttempts: total,
      correctAttempts: correct,
      accuracy: Math.round((correct / total) * 100) || 0,
      avgConfidence: Math.round(avgConfidence * 100),
      avgAccuracy: Math.round(avgAccuracy),
      recentAttempts: attempts.slice(0, 5),
    };
  }
}
