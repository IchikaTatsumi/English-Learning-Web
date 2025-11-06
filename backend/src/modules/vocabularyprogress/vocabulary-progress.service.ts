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

    // Update progress
    progress.practiceAttempts += 1;
    progress.practiceCorrectCount += correctCount;

    // Mark as learned if 3/4 or more correct
    if (correctCount >= 3 && totalQuestions === 4) {
      progress.isLearned = true;
      progress.lastReviewedAt = new Date();
    }

    return await this.progressRepository.save(progress);
  }

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

    // Update bookmark status
    progress.isBookmarked = dto.isBookmarked;

    // Update review datetime when bookmarking
    if (dto.isBookmarked) {
      progress.lastReviewedAt = new Date();
    }

    return await this.progressRepository.save(progress);
  }

  async getLearnedVocabularies(userId: number): Promise<VocabularyProgress[]> {
    return await this.progressRepository.find({
      where: {
        userId,
        isLearned: true,
      },
      relations: ['vocabulary', 'vocabulary.topic'],
      order: { lastReviewedAt: 'DESC' },
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
      lastReviewedAt: progress.lastReviewedAt,
      practiceAttempts: progress.practiceAttempts,
      practiceCorrectCount: progress.practiceCorrectCount,
      accuracy,
    };
  }
}
