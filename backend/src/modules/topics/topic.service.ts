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
    private readonly topicRepository: Repository<Topic>,
    @InjectRepository(Result)
    private readonly resultRepository: Repository<Result>,
  ) {}

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // BASIC CRUD OPERATIONS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async getAllTopics(): Promise<Topic[]> {
    return await this.topicRepository
      .createQueryBuilder('topic')
      // ✅ Đếm số lượng vocabularies và gán vào thuộc tính ảo 'vocabularyCount' của entity
      .loadRelationCountAndMap('topic.vocabularyCount', 'topic.vocabularies')
      .orderBy('topic.createdAt', 'DESC')
      .getMany();
  }

  async getTopicById(id: number): Promise<Topic> {
    const topic = await this.topicRepository
      .createQueryBuilder('topic')
      .loadRelationCountAndMap('topic.vocabularyCount', 'topic.vocabularies')
      .where('topic.id = :id', { id })
      .getOne();

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
    // Lấy topic cũ (để đảm bảo tồn tại)
    const topic = await this.topicRepository.findOne({ where: { id } });
    if (!topic) {
      throw new NotFoundException(`Topic with ID ${id} not found`);
    }

    Object.assign(topic, dto);
    return await this.topicRepository.save(topic);
  }

  async deleteTopic(id: number): Promise<Topic> {
    const topic = await this.topicRepository.findOne({
      where: { id },
      relations: ['vocabularies'], // Load để log số lượng sẽ xóa
    });

    if (!topic) {
      throw new NotFoundException(`Topic with ID ${id} not found`);
    }

    const vocabCount = topic.vocabularies?.length || 0;
    console.log(
      `🗑️ Deleting topic "${topic.topicName}" with ${vocabCount} vocabularies`,
    );

    await this.topicRepository.remove(topic);
    console.log(`✅ Topic deleted successfully`);

    return topic;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FILTER & SEARCH ENDPOINTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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

    if (searchTerm && searchTerm.trim()) {
      queryBuilder.where('LOWER(topic.topic_name) LIKE LOWER(:search)', {
        search: `%${searchTerm.trim()}%`,
      });
    }

    queryBuilder.orderBy('topic.topic_name', 'ASC').limit(limit);

    const results = await queryBuilder.getRawMany<TopicSearchRawResult>();

    return results.map((r) => ({
      id: r.id,
      topicName: r.topicname,
      description: r.description || null,
      vocabularyCount: parseInt(r.vocabularycount, 10) || 0,
    }));
  }

  async getTopicsForFilter(userId?: number): Promise<TopicSearchResultDto[]> {
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

    const results: TopicSearchResultDto[] = topics.map((t) => ({
      id: t.id,
      topicName: t.topicname,
      description: t.description || null,
      vocabularyCount: parseInt(t.vocabularycount, 10) || 0,
    }));

    if (userId) {
      for (const topic of results) {
        const learnedCount = await this.getLearnedVocabCount(topic.id, userId);
        topic.learnedCount = learnedCount;
      }
    }

    return results;
  }

  async getTopicsWithProgress(userId: number): Promise<TopicWithProgress[]> {
    const topics = await this.topicRepository.find({
      relations: ['vocabularies'],
      order: { createdAt: 'DESC' },
    });

    const topicsWithProgress = await Promise.all(
      topics.map(async (topic) => {
        const vocabIdsInTopic = topic.vocabularies.map((v) => v.id);
        const totalWords = vocabIdsInTopic.length;

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

  private async getLearnedVocabCount(
    topicId: number,
    userId: number,
  ): Promise<number> {
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

    return results.filter((r) => {
      const maxCorrect =
        typeof r.maxCorrect === 'string'
          ? parseInt(r.maxCorrect, 10)
          : r.maxCorrect;
      return maxCorrect === 1;
    }).length;
  }
}
