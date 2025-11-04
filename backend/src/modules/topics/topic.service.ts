import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topic } from './entities/topic.entity';
import { CreateTopicDTO, UpdateTopicDTO } from './dtos/topic.dto';
import { Result } from '../results/entities/result.entity';

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

  async deleteTopic(id: number): Promise<Topic> {
    const topic = await this.getTopicById(id);
    await this.topicRepository.remove(topic);
    return topic;
  }

  async getTopicsWithProgress(userId: string): Promise<any[]> {
    const topics = await this.topicRepository.find({
      relations: ['vocabularies'],
      order: { createdAt: 'DESC' },
    });

    const topicsWithProgress = await Promise.all(
      topics.map(async (topic) => {
        const vocabIdsInTopic = topic.vocabularies.map((v) => v.id);
        const totalWords = vocabIdsInTopic.length;

        // Find distinct vocabularies learned (best score >= 80)
        const results = await this.resultRepository
          .createQueryBuilder('result')
          .select('result.vocabId')
          .addSelect('MAX(result.score)', 'maxScore')
          .where('result.userId = :userId', { userId })
          .andWhere('result.vocabId IN (:...vocabIds)', {
            vocabIds: vocabIdsInTopic.length > 0 ? vocabIdsInTopic : [0],
          })
          .groupBy('result.vocabId')
          .having('MAX(result.score) >= 80')
          .getRawMany();

        const learnedCount = results.length;

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
