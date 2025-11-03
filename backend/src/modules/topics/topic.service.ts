import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topic } from './entities/topic.entity';
import { CreateTopicDTO, UpdateTopicDTO } from './dtos/topic.dto';
import { Result } from '../results/entities/result.entity'; // NEW IMPORT

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
      relations: ['lessons'], 
      order: { createdAt: 'DESC' },
    });
  }

  async getTopicById(id: number): Promise<Topic> {
    const topic = await this.topicRepository.findOne({
      where: { id },
      relations: ['lessons', 'lessons.vocabularies'], 
    });
    if (!topic) {
      throw new NotFoundException(`Topic with ID ${id} not found`);
    }
    return topic;
  }
// ... (createTopic, updateTopic, deleteTopic giữ nguyên)

  async getTopicsWithProgress(userId: string): Promise<any[]> {
    const topics = await this.topicRepository.find({
        relations: ['lessons', 'lessons.vocabularies'],
        order: { createdAt: 'DESC' },
    });
    
    // Calculate progress for each topic
    const topicsWithProgress = await Promise.all(
      topics.map(async (topic) => {
        const vocabIdsInTopic = topic.lessons.flatMap(
          (lesson) => lesson.vocabularies.map(v => v.id)
        );

        const totalWords = vocabIdsInTopic.length;
        
        // Find distinct vocabularies learned (best score >= 80)
        const results = await this.resultRepository
            .createQueryBuilder('result')
            .select('result.vocabId')
            .addSelect('MAX(result.score)', 'maxScore')
            .where('result.userId = :userId', { userId })
            .andWhere('result.vocabId IN (:...vocabIds)', { vocabIds: vocabIdsInTopic.length > 0 ? vocabIdsInTopic : [0] })
            .groupBy('result.vocabId')
            .having('MAX(result.score) >= 80')
            .getRawMany();

        const learnedCount = results.length;

        return {
          id: topic.id,
          topicName: topic.topicName,
          description: topic.description,
          createdAt: topic.createdAt,
          lessonsCount: topic.lessons.length,
          totalWords,
          learnedCount,
        };
      })
    );

    return topicsWithProgress;
  }
}