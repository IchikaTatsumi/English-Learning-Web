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
      progress = this.progressRepository.create({ userId, vocabId });
      progress = await this.progressRepository.save(progress);
    }
    return progress;
  }

  /**
   * ✅ NEW: Hàm này được gọi từ ResultService mỗi khi User trả lời 1 câu hỏi
   */
  async updateProgressAfterPractice(
    userId: number,
    vocabId: number,
    isCorrect: boolean,
  ): Promise<void> {
    const progress = await this.getOrCreateProgress(userId, vocabId);

    // 1. Cập nhật thống kê
    progress.practiceAttempts += 1;
    if (isCorrect) {
      progress.practiceCorrectCount += 1;
    }
    progress.lastReviewedAt = new Date();

    // 2. Logic tự động đánh dấu "Đã học" (Learned)
    // Điều kiện: Làm đúng ít nhất 3 lần VÀ tỷ lệ đúng > 80%
    if (!progress.isLearned && progress.practiceAttempts >= 3) {
      const accuracy =
        progress.practiceCorrectCount / progress.practiceAttempts;
      if (accuracy > 0.8) {
        progress.isLearned = true;
        progress.firstLearnedAt = new Date(); // Chỉ set lần đầu tiên
      }
    }

    await this.progressRepository.save(progress);
  }

  // --- Các hàm cũ giữ nguyên ---

  async submitPractice(
    userId: number,
    dto: SubmitPracticeDto,
  ): Promise<VocabularyProgress> {
    const vocab = await this.vocabularyRepository.findOne({
      where: { id: dto.vocabId },
    });
    if (!vocab)
      throw new NotFoundException(`Vocabulary ${dto.vocabId} not found`);

    const progress = await this.getOrCreateProgress(userId, dto.vocabId);
    let correctCount = 0;

    for (const answer of dto.answers) {
      if (
        answer.questionType === 'Pronunciation' ||
        answer.questionType === 'SpeechToWord'
      ) {
        try {
          const sttResult = await this.speechClient.recognizeSpeech({
            audio_base64: answer.userAnswer,
            target_word: vocab.word,
            user_id: userId,
            vocab_id: dto.vocabId,
            save_recording: false,
          });
          answer.userAnswer = sttResult.recognized_text;
          answer.isCorrect = sttResult.is_correct;
          if (sttResult.is_correct) correctCount++;
        } catch {
          answer.isCorrect = false;
          answer.userAnswer = 'Speech recognition failed';
        }
      } else {
        if (answer.isCorrect) correctCount++;
      }
    }

    progress.practiceAttempts += 1;
    progress.practiceCorrectCount += correctCount;
    progress.lastReviewedAt = new Date();

    if (correctCount >= 3 && dto.answers.length >= 4) {
      progress.isLearned = true;
      if (!progress.firstLearnedAt) progress.firstLearnedAt = new Date();
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
    if (!vocab)
      throw new NotFoundException(`Vocabulary ${dto.vocabId} not found`);

    const progress = await this.getOrCreateProgress(userId, dto.vocabId);
    if (dto.isBookmarked) progress.lastReviewedAt = new Date();
    progress.isBookmarked = dto.isBookmarked;

    return await this.progressRepository.save(progress);
  }

  async getLearnedVocabularies(userId: number): Promise<VocabularyProgress[]> {
    return await this.progressRepository.find({
      where: [
        { userId, isLearned: true },
        { userId, isBookmarked: true }, // Lấy cả từ bookmark để hiển thị tab Learned đầy đủ hơn
      ],
      relations: ['vocabulary', 'vocabulary.topic'],
      order: { lastReviewedAt: 'DESC' },
    });
  }

  async getBookmarkedVocabularies(
    userId: number,
  ): Promise<VocabularyProgress[]> {
    return await this.progressRepository.find({
      where: { userId, isBookmarked: true },
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
