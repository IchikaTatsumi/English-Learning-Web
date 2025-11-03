// src/features/topics/services/topic.service.ts
import { TopicDto, CreateTopicDto, UpdateTopicDto } from '../dtos/topic.dto';
import { mockTopics, mockVocabulary } from '@/data/mockData'; 

export class TopicService {
  async getTopics(): Promise<TopicDto[]> {
    // Logic tính toán cho Mock Data để khớp với UI
    const calculatedTopics: TopicDto[] = mockTopics.map(topic => {
        const totalWords = mockVocabulary.filter(v => v.topicId === topic.id).length;
        const learnedWords = mockVocabulary.filter(v => v.topicId === topic.id && v.isLearned).length;
        
        return {
            ...topic,
            totalWords,
            learnedWords
        } as TopicDto;
    });

    return calculatedTopics;
  }

  async getTopic(id: number): Promise<TopicDto | null> {
    const topicData = mockTopics.find(t => t.id === id);
    if (!topicData) return null;
    
    const totalWords = mockVocabulary.filter(v => v.topicId === id).length;
    const learnedWords = mockVocabulary.filter(v => v.topicId === id && v.isLearned).length;

    return { ...topicData, totalWords, learnedWords };
  }

  async createTopic(dto: CreateTopicDto): Promise<TopicDto> {
    throw new Error('Not implemented for mock');
  }
}

export const topicService = new TopicService();