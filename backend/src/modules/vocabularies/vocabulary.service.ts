import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vocabulary } from './entities/vocabulary.entity';
import {
  CreateVocabularyDTO,
  UpdateVocabularyDTO,
} from './dtos/vocabulary.dto';
import { Result } from '../results/entities/result.entity';
import { DifficultyLevel } from 'src/core/enums/difficulty-level.enum';

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
    difficulty?: DifficultyLevel,
  ): Promise<Vocabulary[]> {
    const queryBuilder = this.vocabularyRepository
      .createQueryBuilder('vocab')
      .leftJoinAndSelect('vocab.topic', 'topic')
      .orderBy('RANDOM()')
      .limit(count);

    if (difficulty) {
      queryBuilder.where('vocab.difficultyLevel = :difficulty', { difficulty });
    }

    return await queryBuilder.getMany();
  }

  async getVocabulariesWithProgress(
    userId: string,
    topicId?: number,
  ): Promise<any[]> {
    const queryBuilder = this.vocabularyRepository
      .createQueryBuilder('vocab')
      .leftJoinAndSelect('vocab.topic', 'topic');

    if (topicId) {
      queryBuilder.where('vocab.topicId = :topicId', { topicId });
    }

    const vocabularies = await queryBuilder.getMany();

    const vocabulariesWithProgress = await Promise.all(
      vocabularies.map(async (vocab) => {
        const results = await this.resultRepository.find({
          where: {
            vocabId: vocab.id,
            userId,
          },
          order: { score: 'DESC' },
        });

        const bestScore = results.length > 0 ? results[0].score : 0;
        const isLearned = bestScore >= 80;
        const lastReviewed = results.length > 0 ? results[0].createdAt : null;
        const attemptCount = results.length;

        return {
          ...vocab,
          isLearned,
          bestScore,
          lastReviewed,
          attemptCount,
        };
      }),
    );

    return vocabulariesWithProgress;
  }

  async getVocabulariesByDifficulty(
    difficulty: DifficultyLevel,
    limit?: number,
  ): Promise<Vocabulary[]> {
    const queryBuilder = this.vocabularyRepository
      .createQueryBuilder('vocab')
      .leftJoinAndSelect('vocab.topic', 'topic')
      .where('vocab.difficultyLevel = :difficulty', { difficulty });

    if (limit) {
      queryBuilder.limit(limit);
    }

    return await queryBuilder.getMany();
  }
}
