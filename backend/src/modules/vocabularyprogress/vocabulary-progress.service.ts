import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VocabularyProgress } from './entities/vocabulary-progress.entity';
import { Vocabulary } from '../vocabularies/entities/vocabulary.entity';
import {
  SubmitPracticeDto,
  BookmarkVocabDto,
} from './dto/vocabulary-practice.dto';
import { SpeechClientService } from '../speech/speech-client.service';

@Injectable()
export class VocabularyProgressService {
  constructor(
    @InjectRepository(VocabularyProgress)
    private progressRepository: Repository<VocabularyProgress>,
    @InjectRepository(Vocabulary)
    private vocabularyRepository: Repository<Vocabulary>,
    private speechClient: SpeechClientService,
  ) {}

  async getOrCreateProgress(
    userId: number,
    vocabId: number,
  ): Promise<VocabularyProgress> {
    let progress = await this.progressRepository.findOne({
      where: { userId, vocabId },
    });

    if (!progress) {
      progress = this.progressRepository.create({
        userId,
        vocabId,
      });
      progress = await this.progressRepository.save(progress);
    }

    return progress;
  }

  /**
   * ✅ UPDATED: Handle all 4 question types including pronunciation
   *
   * Question Types:
   * 1. WordToMeaning - MCQ (text input)
   * 2. MeaningToWord - MCQ (text input)
   * 3. VietnameseToWord - Fill-in (text input)
   * 4. Pronunciation - Speech (audio → STT → text comparison)
   */
  async submitPractice(
    userId: number,
    dto: SubmitPracticeDto,
  ): Promise<VocabularyProgress> {
    // Verify vocabulary exists
    const vocab = await this.vocabularyRepository.findOne({
      where: { id: dto.vocabId },
    });

    if (!vocab) {
      throw new NotFoundException(
        `Vocabulary with ID ${dto.vocabId} not found`,
      );
    }

    // Get or create progress
    const progress = await this.getOrCreateProgress(userId, dto.vocabId);

    // ✅ Process answers (handle pronunciation specially)
    let correctCount = 0;

    for (const answer of dto.answers) {
      // ✅ Handle pronunciation questions
      if (answer.questionType === 'Pronunciation') {
        try {
          // userAnswer contains base64 audio
          const sttResult = await this.speechClient.recognizeSpeech({
            audio_base64: answer.userAnswer,
            target_word: vocab.word,
            user_id: userId,
            vocab_id: dto.vocabId,
            save_recording: false,
          });

          // Update answer with STT result
          answer.userAnswer = sttResult.recognized_text; // Show what user said
          answer.isCorrect = sttResult.is_correct; // true/false

          if (sttResult.is_correct) {
            correctCount++;
          }
        } catch {
          // ✅ Removed unused 'error' variable
          // If STT fails, mark as wrong
          answer.isCorrect = false;
          answer.userAnswer = 'Speech recognition failed';
        }
      } else {
        // ✅ Handle text-based questions (already marked as correct/wrong)
        if (answer.isCorrect) {
          correctCount++;
        }
      }
    }

    const totalQuestions = dto.answers.length;

    // Update practice stats
    progress.practiceAttempts += 1;
    progress.practiceCorrectCount += correctCount;

    // ✅ Always update last_reviewed_at when practicing
    progress.lastReviewedAt = new Date();

    // ✅ Set first_learned_at ONCE when passing (3/4 correct)
    if (correctCount >= 3 && totalQuestions === 4) {
      progress.isLearned = true;

      // Only set first_learned_at if null
      if (!progress.firstLearnedAt) {
        progress.firstLearnedAt = new Date();
      }
    }

    return await this.progressRepository.save(progress);
  }

  async toggleBookmark(
    userId: number,
    dto: BookmarkVocabDto,
  ): Promise<VocabularyProgress> {
    const vocab = await this.vocabularyRepository.findOne({
      where: { id: dto.vocabId },
    });

    if (!vocab) {
      throw new NotFoundException(
        `Vocabulary with ID ${dto.vocabId} not found`,
      );
    }

    const progress = await this.getOrCreateProgress(userId, dto.vocabId);

    // Update last_reviewed_at only when bookmarking (true)
    if (dto.isBookmarked) {
      progress.lastReviewedAt = new Date();
    }

    progress.isBookmarked = dto.isBookmarked;

    return await this.progressRepository.save(progress);
  }

  async getLearnedVocabularies(userId: number): Promise<VocabularyProgress[]> {
    return await this.progressRepository.find({
      where: {
        userId,
        isLearned: true,
      },
      relations: ['vocabulary', 'vocabulary.topic'],
      order: { firstLearnedAt: 'DESC' },
    });
  }

  async getBookmarkedVocabularies(
    userId: number,
  ): Promise<VocabularyProgress[]> {
    return await this.progressRepository.find({
      where: {
        userId,
        isBookmarked: true,
      },
      relations: ['vocabulary', 'vocabulary.topic'],
      order: { lastReviewedAt: 'DESC' },
    });
  }

  async getProgressByVocabId(
    userId: number,
    vocabId: number,
  ): Promise<VocabularyProgress | null> {
    return await this.progressRepository.findOne({
      where: { userId, vocabId },
      relations: ['vocabulary'],
    });
  }

  async getProgressStats(userId: number, vocabId: number) {
    const progress = await this.getProgressByVocabId(userId, vocabId);

    if (!progress) {
      return {
        vocabId,
        isLearned: false,
        isBookmarked: false,
        firstLearnedAt: null,
        lastReviewedAt: null,
        practiceAttempts: 0,
        practiceCorrectCount: 0,
        accuracy: 0,
      };
    }

    const accuracy =
      progress.practiceAttempts > 0
        ? Math.round(
            (progress.practiceCorrectCount / (progress.practiceAttempts * 4)) *
              100,
          )
        : 0;

    return {
      vocabId: progress.vocabId,
      isLearned: progress.isLearned,
      isBookmarked: progress.isBookmarked,
      firstLearnedAt: progress.firstLearnedAt,
      lastReviewedAt: progress.lastReviewedAt,
      practiceAttempts: progress.practiceAttempts,
      practiceCorrectCount: progress.practiceCorrectCount,
      accuracy,
    };
  }
}
