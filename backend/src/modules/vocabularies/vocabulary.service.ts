import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Vocabulary } from './entities/vocabulary.entity';
import { VocabularyProgress } from '../vocabularyprogress/entities/vocabulary-progress.entity';
import { CreateVocabularyDTO, UpdateVocabularyDTO } from './dto/vocabulary.dto';
import {
  VocabularyFilterDto,
  TopicSearchRawResult,
} from './dto/vocabulary-filter.dto';
import { Result } from '../results/entities/result.entity';
import { Topic } from '../topics/entities/topic.entity';
import { DifficultyLevel } from 'src/core/enums/difficulty-level.enum';

@Injectable()
export class VocabularyService {
  constructor(
    @InjectRepository(Vocabulary)
    private vocabularyRepository: Repository<Vocabulary>,
    @InjectRepository(VocabularyProgress)
    private progressRepository: Repository<VocabularyProgress>,
    @InjectRepository(Result)
    private resultRepository: Repository<Result>,
    @InjectRepository(Topic)
    private topicRepository: Repository<Topic>,
  ) {}

  /**
   * ✅ MAIN METHOD: Get vocabularies with flexible filtering
   *
   * Logic Flow:
   * 1. All topics (topicId = null)
   * 2. Specific topic (topicId = X)
   * 3. All difficulties (difficulty = Mixed Levels hoặc null)
   * 4. Specific difficulty (Beginner/Intermediate/Advanced)
   * 5. Learned only (onlyLearned = true)
   * 6. Recently learned (recentlyLearned = true)
   */
  async getVocabulariesWithFilters(
    filters: VocabularyFilterDto,
    userId?: number,
  ): Promise<{ data: Vocabulary[]; total: number }> {
    // Build base query
    const queryBuilder = this.createFilteredQuery(filters, userId);

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
    userId?: number,
  ): SelectQueryBuilder<Vocabulary> {
    const queryBuilder = this.vocabularyRepository
      .createQueryBuilder('vocab')
      .leftJoinAndSelect('vocab.topic', 'topic');

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // FILTER 1: Search by word/meaning
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
    // FILTER 2: Difficulty Level
    // All = Mixed Levels hoặc không truyền
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (filters.difficulty && filters.difficulty !== DifficultyLevel.MIXED) {
      queryBuilder.andWhere('vocab.difficultyLevel = :difficulty', {
        difficulty: filters.difficulty,
      });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // FILTER 3: Topic
    // All topics = topicId is null/undefined
    // Specific topic = topicId is provided
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (filters.topicId) {
      queryBuilder.andWhere('vocab.topicId = :topicId', {
        topicId: filters.topicId,
      });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // FILTER 4: Learned Vocabularies (Tab "Learned")
    // Join với vocabulary_progress
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (filters.onlyLearned && userId) {
      queryBuilder
        .innerJoin(
          'vocabulary_progress',
          'vp',
          'vp.vocab_id = vocab.vocab_id AND vp.user_id = :userId AND vp.is_learned = true',
          { userId },
        )
        .addSelect('vp.first_learned_at', 'firstLearnedAt');
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

    // ✅ Special case: Recently learned (sort by first_learned_at DESC)
    if (filters.recentlyLearned && filters.onlyLearned) {
      queryBuilder.orderBy('vp.first_learned_at', 'DESC');
      return;
    }

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
      case 'firstLearnedAt':
        if (filters.onlyLearned) {
          queryBuilder.orderBy('vp.first_learned_at', sortOrder);
        } else {
          queryBuilder.orderBy('vocab.createdAt', sortOrder);
        }
        break;
      default:
        queryBuilder.orderBy('vocab.word', 'ASC');
    }
  }

  /**
   * ✅ Search topics for autocomplete dropdown
   * GET /vocabularies/topics/search?q=Anim
   */
  async searchTopics(
    searchTerm?: string,
    limit = 10,
  ): Promise<
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
        'topic.id AS id',
        'topic.topic_name AS topicName',
        'topic.description AS description',
        'COUNT(vocab.vocab_id) AS vocabularyCount',
      ])
      .groupBy('topic.id');

    if (searchTerm && searchTerm.trim()) {
      queryBuilder.where('LOWER(topic.topic_name) LIKE LOWER(:search)', {
        search: `%${searchTerm.trim()}%`,
      });
    }

    queryBuilder.orderBy('topic.topic_name', 'ASC').limit(limit);

    const results = await queryBuilder.getRawMany();

    return results.map((r) => ({
      id: r.id,
      topicName: r.topicname,
      description: r.description || '',
      vocabularyCount: parseInt(r.vocabularycount, 10) || 0,
    }));
  }

  /**
   * ✅ Reset filter - trả về default state
   * Gọi method này với filters = {}
   */
  async getDefaultVocabularies(): Promise<Vocabulary[]> {
    return await this.vocabularyRepository.find({
      relations: ['topic'],
      order: { word: 'ASC' },
    });
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
}
