import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Vocabulary } from './entities/vocabulary.entity';
import { CreateVocabularyDTO, UpdateVocabularyDTO } from './dto/vocabulary.dto';
import { VocabularyFilterDto } from './dto/vocabulary-filter.dto';
import { Result } from '../results/entities/result.entity';
import { Topic } from '../topics/entities/topic.entity';

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
    @InjectRepository(Topic)
    private topicRepository: Repository<Topic>,
  ) {}

  /**
   * ✅ MAIN METHOD: Get vocabularies with flexible filtering and optional pagination
   */
  async getVocabulariesWithFilters(
    filters: VocabularyFilterDto,
  ): Promise<{ data: Vocabulary[]; total: number }> {
    // Build base query
    const queryBuilder = this.createFilteredQuery(filters);

    // Apply sorting
    this.applySorting(queryBuilder, filters);

    // Apply pagination if enabled
    if (filters.paginate) {
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const skip = (page - 1) * limit;

      queryBuilder.skip(skip).take(limit);
    }

    // Execute query
    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  /**
   * ✅ Create filtered query builder
   */
  private createFilteredQuery(
    filters: VocabularyFilterDto,
  ): SelectQueryBuilder<Vocabulary> {
    const queryBuilder = this.vocabularyRepository
      .createQueryBuilder('vocab')
      .leftJoinAndSelect('vocab.topic', 'topic');

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // FILTER 1: Search by word name
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (filters.search && filters.search.trim()) {
      queryBuilder.andWhere(
        '(LOWER(vocab.word) LIKE LOWER(:search) OR ' +
          'LOWER(vocab.meaningEn) LIKE LOWER(:search) OR ' +
          'LOWER(vocab.meaningVi) LIKE LOWER(:search))',
        { search: `%${filters.search.trim()}%` },
      );
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // FILTER 2: Filter by difficulty level
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (filters.difficulty && filters.difficulty !== DifficultyLevel.MIXED) {
      queryBuilder.andWhere('vocab.difficultyLevel = :difficulty', {
        difficulty: filters.difficulty,
      });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // FILTER 3: Filter by topic
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (filters.topicId) {
      queryBuilder.andWhere('vocab.topicId = :topicId', {
        topicId: filters.topicId,
      });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // FILTER 4: Search topics by name (for category filter)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (filters.topicSearch && filters.topicSearch.trim()) {
      queryBuilder.andWhere('LOWER(topic.topicName) LIKE LOWER(:topicSearch)', {
        topicSearch: `%${filters.topicSearch.trim()}%`,
      });
    }

    return queryBuilder;
  }

  /**
   * ✅ Apply sorting
   */
  private applySorting(
    queryBuilder: SelectQueryBuilder<Vocabulary>,
    filters: VocabularyFilterDto,
  ): void {
    const sortBy = filters.sortBy || 'word';
    const sortOrder = (filters.sortOrder || 'ASC').toUpperCase() as
      | 'ASC'
      | 'DESC';

    switch (sortBy) {
      case 'word':
        queryBuilder.orderBy('vocab.word', sortOrder);
        break;
      case 'createdAt':
        queryBuilder.orderBy('vocab.createdAt', sortOrder);
        break;
      case 'difficultyLevel':
        queryBuilder.orderBy('vocab.difficultyLevel', sortOrder);
        break;
      default:
        queryBuilder.orderBy('vocab.word', 'ASC');
    }
  }

  /**
   * ✅ Search topics for category dropdown
   */
  async searchTopics(searchTerm?: string): Promise<
    Array<{
      id: number;
      topicName: string;
      description: string;
      vocabularyCount: number;
    }>
  > {
    const queryBuilder = this.topicRepository
      .createQueryBuilder('topic')
      .leftJoin('topic.vocabularies', 'vocab')
      .select([
        'topic.id',
        'topic.topicName',
        'topic.description',
        'COUNT(vocab.id) as vocabularyCount',
      ])
      .groupBy('topic.id');

    if (searchTerm && searchTerm.trim()) {
      queryBuilder.where('LOWER(topic.topicName) LIKE LOWER(:search)', {
        search: `%${searchTerm.trim()}%`,
      });
    }

    queryBuilder.orderBy('topic.topicName', 'ASC');

    const results = await queryBuilder.getRawMany();

    return results.map((r) => ({
      id: r.topic_id,
      topicName: r.topic_topicName,
      description: r.topic_description,
      vocabularyCount: parseInt(r.vocabularyCount, 10) || 0,
    }));
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // EXISTING METHODS (unchanged)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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
