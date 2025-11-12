import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Vocabulary } from './entities/vocabulary.entity';
import { VocabularyProgress } from '../vocabularyprogress/entities/vocabulary-progress.entity';
import { CreateVocabularyDTO, UpdateVocabularyDTO } from './dto/vocabulary.dto';
import { VocabularyFilterDto } from './dto/vocabulary-filter.dto';
import { Result } from '../results/entities/result.entity';
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
    // ❌ REMOVED: Topic repository (dùng TopicService thay thế)
  ) {}

  /**
   * ✅ MAIN METHOD: Get vocabularies with flexible filtering
   */
  async getVocabulariesWithFilters(
    filters: VocabularyFilterDto,
    userId?: number,
  ): Promise<{ data: Vocabulary[]; total: number }> {
    const queryBuilder = this.createFilteredQuery(filters, userId);
    this.applySorting(queryBuilder, filters);

    if (filters.paginate) {
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip).take(limit);
    }

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

    // FILTER 1: Search by word/meaning
    if (filters.search && filters.search.trim()) {
      queryBuilder.andWhere(
        '(LOWER(vocab.word) LIKE LOWER(:search) OR ' +
          'LOWER(vocab.meaningEn) LIKE LOWER(:search) OR ' +
          'LOWER(vocab.meaningVi) LIKE LOWER(:search))',
        { search: `%${filters.search.trim()}%` },
      );
    }

    // FILTER 2: Difficulty Level
    if (filters.difficulty && filters.difficulty !== DifficultyLevel.MIXED) {
      queryBuilder.andWhere('vocab.difficultyLevel = :difficulty', {
        difficulty: filters.difficulty,
      });
    }

    // FILTER 3: Topic (chính xác theo topicId được chọn)
    if (filters.topicId) {
      queryBuilder.andWhere('vocab.topicId = :topicId', {
        topicId: filters.topicId,
      });
    }

    // FILTER 4: Learned Vocabularies
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

  // ❌ REMOVED: searchTopics() method
  // Use TopicService.searchTopics() instead

  /**
   * ✅ Reset filter - default state
   */
  async getDefaultVocabularies(): Promise<Vocabulary[]> {
    return await this.vocabularyRepository.find({
      relations: ['topic'],
      order: { word: 'ASC' },
    });
  }

  // ... other methods remain unchanged
}
