import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topic } from './entities/topic.entity';
import { CreateTopicDTO, UpdateTopicDTO } from './dto/topic.dto';
import { Result } from '../results/entities/result.entity';

interface TopicWithProgress {
  id: number;
  topicName: string;
  description: string;
  createdAt: Date;
  totalWords: number;
  learnedCount: number;
}

interface VocabProgressRaw {
  vocabId: number;
  maxCorrect: number | string;
}

@Injectable()
export class TopicService {
  constructor(
    @InjectRepository(Topic)
    private topicRepository: Repository<Topic>,
    @InjectRepository(Result)
    private resultRepository: Repository<Result>,
  ) {}

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

  /**
   * ✅ DELETE CASCADE LOGIC:
   * Khi xóa topic -> tự động xóa:
   * 1. Tất cả vocabularies thuộc topic
   * 2. Tất cả quiz_questions của các vocabularies đó
   * 3. Tất cả results liên quan
   * (Nhờ vào ON DELETE CASCADE trong database)
   */
  async deleteTopic(id: number): Promise<Topic> {
    const topic = await this.getTopicById(id);

    // Lấy số lượng vocabularies để log
    const vocabCount = topic.vocabularies?.length || 0;

    console.log(
      `🗑️ Deleting topic "${topic.topicName}" with ${vocabCount} vocabularies`,
    );

    // TypeORM + Database CASCADE sẽ tự động xóa:
    // - vocabularies (ON DELETE CASCADE)
    // - quiz_questions (ON DELETE CASCADE từ vocab)
    // - results (ON DELETE CASCADE từ quiz_questions)
    await this.topicRepository.remove(topic);

    console.log(
      `✅ Topic deleted successfully (${vocabCount} vocabularies removed)`,
    );

    return topic;
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
}
