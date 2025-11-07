import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topic } from './entities/topic.entity';
import { CreateTopicDTO, UpdateTopicDTO } from './dto/topic.dto';
import { Result } from '../results/entities/result.entity';
import {
  TopicSearchResultDto,
  TopicSearchRawResult,
  TopicListRawResult,
  VocabProgressRaw,
} from './dto/topic-filter.dto';

/**
 * ✅ Type-safe interface for topic with progress
 */
interface TopicWithProgress {
  id: number;
  topicName: string;
  description: string;
  createdAt: Date;
  totalWords: number;
  learnedCount: number;
}

@Injectable()
export class TopicService {
  constructor(
    @InjectRepository(Topic)
    private topicRepository: Repository<Topic>,
    @InjectRepository(Result)
    private resultRepository: Repository<Result>,
  ) {}

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // BASIC CRUD OPERATIONS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async getAllTopics(): Promise<Topic[]> {
    return await this.topicRepository.find({
      relations: ['vocabularies'],
      order: { createdAt: 'DESC' },
    });
  }

  async getTopicById(id: number): Promise<Topic> {
    const topic = await this.topicRepository.findOne({
      where: { id },
      relations: ['vocabularies'],
    });
    if (!topic) {
      throw new NotFoundException(`Topic with ID ${id} not found`);
    }
    return topic;
  }

  async createTopic(dto: CreateTopicDTO): Promise<Topic> {
    const topic = this.topicRepository.create(dto);
    return await this.topicRepository.save(topic);
  }

  async updateTopic(id: number, dto: UpdateTopicDTO): Promise<Topic> {
    const topic = await this.getTopicById(id);
    Object.assign(topic, dto);
    return await this.topicRepository.save(topic);
  }

  async deleteTopic(id: number): Promise<Topic> {
    const topic = await this.getTopicById(id);
    const vocabCount = topic.vocabularies?.length || 0;

    console.log(
      `🗑️ Deleting topic "${topic.topicName}" with ${vocabCount} vocabularies`,
    );

    await this.topicRepository.remove(topic);

    console.log(
      `✅ Topic deleted successfully (${vocabCount} vocabularies removed)`,
    );

    return topic;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✅ FILTER & SEARCH ENDPOINTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * ✅ Search topics by name (autocomplete)
   * Used for: GET /topics/search?q=Anim&limit=10
   *
   * @param searchTerm - Optional search string
   * @param limit - Max results (default 10)
   * @returns Array of topics with vocab counts
   */
  async searchTopics(
    searchTerm?: string,
    limit = 10,
  ): Promise<TopicSearchResultDto[]> {
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

    // Apply search filter if provided
    if (searchTerm && searchTerm.trim()) {
      queryBuilder.where('LOWER(topic.topic_name) LIKE LOWER(:search)', {
        search: `%${searchTerm.trim()}%`,
      });
    }

    queryBuilder.orderBy('topic.topic_name', 'ASC').limit(limit);

    // ✅ Type-safe raw query results
    const results = await queryBuilder.getRawMany<TopicSearchRawResult>();

    // ✅ Transform to DTO with explicit type conversion
    return results.map((r) => ({
      id: r.id,
      topicName: r.topicname, // PostgreSQL returns lowercase
      description: r.description || null,
      vocabularyCount: parseInt(r.vocabularycount, 10) || 0, // String → Number
    }));
  }

  /**
   * ✅ Get all topics for filter dropdown
   * Used for: GET /topics/list
   *
   * @param userId - Optional user ID to include learned counts
   * @returns Array of topics with vocab counts and optional learned counts
   */
  async getTopicsForFilter(userId?: number): Promise<TopicSearchResultDto[]> {
    // Get all topics with vocabulary counts
    const topics = await this.topicRepository
      .createQueryBuilder('topic')
      .leftJoin('topic.vocabularies', 'vocab')
      .select([
        'topic.id AS id',
        'topic.topic_name AS topicName',
        'topic.description AS description',
        'COUNT(vocab.vocab_id) AS vocabularyCount',
      ])
      .groupBy('topic.id')
      .orderBy('topic.topic_name', 'ASC')
      .getRawMany<TopicListRawResult>();

    // ✅ Transform to DTO
    const results: TopicSearchResultDto[] = topics.map((t) => ({
      id: t.id,
      topicName: t.topicname,
      description: t.description || null,
      vocabularyCount: parseInt(t.vocabularycount, 10) || 0,
    }));

    // ✅ Add learned count if user is authenticated
    if (userId) {
      for (const topic of results) {
        const learnedCount = await this.getLearnedVocabCount(topic.id, userId);
        topic.learnedCount = learnedCount;
      }
    }

    return results;
  }

  /**
   * ✅ Get topics with learning progress
   * Used for: GET /topics/progress (authenticated users)
   *
   * @param userId - Current user ID
   * @returns Topics with learned/total word counts
   */
  async getTopicsWithProgress(userId: number): Promise<TopicWithProgress[]> {
    const topics = await this.topicRepository.find({
      relations: ['vocabularies'],
      order: { createdAt: 'DESC' },
    });

    const topicsWithProgress = await Promise.all(
      topics.map(async (topic) => {
        const vocabIdsInTopic = topic.vocabularies.map((v) => v.id);
        const totalWords = vocabIdsInTopic.length;

        // Return empty progress if no vocabularies
        if (totalWords === 0) {
          return {
            id: topic.id,
            topicName: topic.topicName,
            description: topic.description,
            createdAt: topic.createdAt,
            totalWords: 0,
            learnedCount: 0,
          };
        }

        // ✅ Type-safe query for vocabulary progress
        const results = await this.resultRepository
          .createQueryBuilder('result')
          .leftJoin('result.quizQuestion', 'quizQuestion')
          .select('quizQuestion.vocabId', 'vocabId')
          .addSelect(
            'MAX(CASE WHEN result.isCorrect THEN 1 ELSE 0 END)',
            'maxCorrect',
          )
          .where('result.userId = :userId', { userId })
          .andWhere('quizQuestion.vocabId IN (:...vocabIds)', {
            vocabIds: vocabIdsInTopic,
          })
          .groupBy('quizQuestion.vocabId')
          .getRawMany<VocabProgressRaw>();

        // ✅ Count learned vocabularies with type-safe conversion
        const learnedCount = results.filter((r) => {
          const maxCorrect =
            typeof r.maxCorrect === 'string'
              ? parseInt(r.maxCorrect, 10)
              : r.maxCorrect;
          return maxCorrect === 1;
        }).length;

        return {
          id: topic.id,
          topicName: topic.topicName,
          description: topic.description,
          createdAt: topic.createdAt,
          totalWords,
          learnedCount,
        };
      }),
    );

    return topicsWithProgress;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ✅ HELPER METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * ✅ Count learned vocabularies in a topic for a user
   *
   * @param topicId - Topic ID
   * @param userId - User ID
   * @returns Number of learned vocabularies
   */
  private async getLearnedVocabCount(
    topicId: number,
    userId: number,
  ): Promise<number> {
    // ✅ Type-safe query
    const results = await this.resultRepository
      .createQueryBuilder('result')
      .leftJoin('result.quizQuestion', 'quizQuestion')
      .leftJoin('quizQuestion.vocabulary', 'vocab')
      .select('quizQuestion.vocabId', 'vocabId')
      .addSelect(
        'MAX(CASE WHEN result.isCorrect THEN 1 ELSE 0 END)',
        'maxCorrect',
      )
      .where('result.userId = :userId', { userId })
      .andWhere('vocab.topicId = :topicId', { topicId })
      .groupBy('quizQuestion.vocabId')
      .getRawMany<VocabProgressRaw>();

    // ✅ Type-safe filtering
    return results.filter((r) => {
      const maxCorrect =
        typeof r.maxCorrect === 'string'
          ? parseInt(r.maxCorrect, 10)
          : r.maxCorrect;
      return maxCorrect === 1;
    }).length;
  }
}
