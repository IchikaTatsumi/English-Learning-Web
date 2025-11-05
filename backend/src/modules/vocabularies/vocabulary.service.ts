import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vocabulary } from './entities/vocabulary.entity';
import { CreateVocabularyDTO, UpdateVocabularyDTO } from './dto/vocabulary.dto';
import { Result } from '../results/entities/result.entity';
import { DifficultyLevel } from 'src/core/enums/difficulty-level.enum';

// ✅ FIX: Thêm interface cho VocabularyWithProgress
interface VocabularyWithProgress {
  id: number;
  topicId: number;
  word: string;
  ipa: string;
  meaningEn: string;
  meaningVi: string;
  exampleSentence: string;
  audioPath: string;
  difficultyLevel: string;
  createdAt: Date;
  topic?: {
    id: number;
    topicName: string;
  };
  isLearned: boolean;
  bestScore: number;
  lastReviewed: Date | null;
  attemptCount: number;
}

@Injectable()
export class VocabularyService {
  constructor(
    @InjectRepository(Vocabulary)
    private vocabularyRepository: Repository<Vocabulary>,
    @InjectRepository(Result)
    private resultRepository: Repository<Result>,
  ) {}

  async getAllVocabularies(): Promise<Vocabulary[]> {
    return await this.vocabularyRepository.find({
      relations: ['topic'],
      order: { createdAt: 'DESC' },
    });
  }

  async getVocabulariesByTopicId(topicId: number): Promise<Vocabulary[]> {
    return await this.vocabularyRepository.find({
      where: { topicId },
      relations: ['topic'],
      order: { word: 'ASC' },
    });
  }

  async getVocabularyById(id: number): Promise<Vocabulary> {
    const vocabulary = await this.vocabularyRepository.findOne({
      where: { id },
      relations: ['topic'],
    });

    if (!vocabulary) {
      throw new NotFoundException(`Vocabulary with ID ${id} not found`);
    }

    return vocabulary;
  }

  async createVocabulary(dto: CreateVocabularyDTO): Promise<Vocabulary> {
    // ✅ FIX: Bây giờ đơn giản hơn vì DTO đã có type đúng
    const vocabulary = this.vocabularyRepository.create(dto);
    return await this.vocabularyRepository.save(vocabulary);
  }

  async updateVocabulary(
    id: number,
    dto: UpdateVocabularyDTO,
  ): Promise<Vocabulary> {
    const vocabulary = await this.getVocabularyById(id);
    Object.assign(vocabulary, dto);
    return await this.vocabularyRepository.save(vocabulary);
  }

  async deleteVocabulary(id: number): Promise<void> {
    const vocabulary = await this.getVocabularyById(id);
    await this.vocabularyRepository.remove(vocabulary);
  }

  async searchVocabularies(query: string): Promise<Vocabulary[]> {
    return await this.vocabularyRepository
      .createQueryBuilder('vocab')
      .leftJoinAndSelect('vocab.topic', 'topic')
      .where('LOWER(vocab.word) LIKE LOWER(:query)', { query: `%${query}%` })
      .orWhere('LOWER(vocab.meaningEn) LIKE LOWER(:query)', {
        query: `%${query}%`,
      })
      .orWhere('LOWER(vocab.meaningVi) LIKE LOWER(:query)', {
        query: `%${query}%`,
      })
      .orderBy('vocab.word', 'ASC')
      .getMany();
  }

  async getRandomVocabularies(
    count: number = 10,
    difficulty?: string,
  ): Promise<Vocabulary[]> {
    const queryBuilder = this.vocabularyRepository
      .createQueryBuilder('vocab')
      .leftJoinAndSelect('vocab.topic', 'topic')
      .orderBy('RANDOM()')
      .limit(count);

    if (difficulty && difficulty !== 'Mixed Levels') {
      queryBuilder.where('vocab.difficultyLevel = :difficulty', { difficulty });
    }

    return await queryBuilder.getMany();
  }

  async getVocabulariesWithProgress(
    userId: number,
    topicId?: number,
  ): Promise<VocabularyWithProgress[]> {
    const queryBuilder = this.vocabularyRepository
      .createQueryBuilder('vocab')
      .leftJoinAndSelect('vocab.topic', 'topic');

    if (topicId) {
      queryBuilder.where('vocab.topicId = :topicId', { topicId });
    }

    const vocabularies = await queryBuilder.getMany();

    const vocabulariesWithProgress: VocabularyWithProgress[] =
      await Promise.all(
        vocabularies.map(async (vocab) => {
          const results = await this.resultRepository
            .createQueryBuilder('result')
            .leftJoin('result.quizQuestion', 'quizQuestion')
            .where('result.userId = :userId', { userId })
            .andWhere('quizQuestion.vocabId = :vocabId', { vocabId: vocab.id })
            .orderBy('result.createdAt', 'DESC')
            .getMany();

          let bestScore = 0;
          if (results.length > 0) {
            const correctCount = results.filter((r) => r.isCorrect).length;
            bestScore = Math.round((correctCount / results.length) * 100);
          }

          const isLearned = bestScore >= 80;
          const lastReviewed = results.length > 0 ? results[0].createdAt : null;
          const attemptCount = results.length;

          return {
            id: vocab.id,
            topicId: vocab.topicId,
            word: vocab.word,
            ipa: vocab.ipa,
            meaningEn: vocab.meaningEn,
            meaningVi: vocab.meaningVi,
            exampleSentence: vocab.exampleSentence,
            audioPath: vocab.audioPath,
            difficultyLevel: vocab.difficultyLevel,
            createdAt: vocab.createdAt,
            topic: vocab.topic
              ? {
                  id: vocab.topic.id,
                  topicName: vocab.topic.topicName,
                }
              : undefined,
            isLearned,
            bestScore,
            lastReviewed,
            attemptCount,
          };
        }),
      );

    return vocabulariesWithProgress;
  }
}
