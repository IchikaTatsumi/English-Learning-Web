import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VocabularyProgress } from './entities/vocabulary-progress.entity';
import { Vocabulary } from '../vocabularies/entities/vocabulary.entity';
import {
  SubmitPracticeDto,
  BookmarkVocabDto,
} from './dto/vocabulary-practice.dto';

@Injectable()
export class VocabularyProgressService {
  constructor(
    @InjectRepository(VocabularyProgress)
    private progressRepository: Repository<VocabularyProgress>,
    @InjectRepository(Vocabulary)
    private vocabularyRepository: Repository<Vocabulary>,
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
   * ✅ LOGIC MỚI: Submit Practice
   * - Luôn update last_reviewed_at khi Practice
   * - Chỉ set first_learned_at một lần duy nhất khi đạt 3/4 câu đúng
   * - first_learned_at không bao giờ thay đổi sau khi được set
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

    // Count correct answers
    const correctCount = dto.answers.filter((a) => a.isCorrect).length;
    const totalQuestions = dto.answers.length;

    // Update practice stats
    progress.practiceAttempts += 1;
    progress.practiceCorrectCount += correctCount;

    // ✅ CRITICAL: Luôn update last_reviewed_at khi Practice
    progress.lastReviewedAt = new Date();

    // ✅ CRITICAL: Chỉ set first_learned_at MỘT LẦN duy nhất
    // Khi đạt 3/4 câu đúng và chưa có first_learned_at
    if (correctCount >= 3 && totalQuestions === 4) {
      progress.isLearned = true;

      // Chỉ set first_learned_at nếu chưa có (null)
      if (!progress.firstLearnedAt) {
        progress.firstLearnedAt = new Date();
      }
    }

    return await this.progressRepository.save(progress);
  }

  /**
   * ✅ LOGIC MỚI: Toggle Bookmark
   * - Khi bookmark (true): update last_reviewed_at
   * - Khi gỡ bookmark (false): KHÔNG update last_reviewed_at
   * - Khi bookmark lại (false -> true): update last_reviewed_at
   */
  async toggleBookmark(
    userId: number,
    dto: BookmarkVocabDto,
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

    // ✅ CRITICAL: Chỉ update last_reviewed_at khi bookmark (true)
    // Không update khi gỡ bookmark (false)
    if (dto.isBookmarked) {
      progress.lastReviewedAt = new Date();
    }

    // Update bookmark status
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
      order: { firstLearnedAt: 'DESC' }, // ✅ Sort by firstLearnedAt
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
      firstLearnedAt: progress.firstLearnedAt, // ✅ Thêm field này
      lastReviewedAt: progress.lastReviewedAt,
      practiceAttempts: progress.practiceAttempts,
      practiceCorrectCount: progress.practiceCorrectCount,
      accuracy,
    };
  }
}
