import { TopicDto, CreateTopicDto, UpdateTopicDto } from '../dtos/topic.dto';
import { mockVocabulary } from '@/data/mockData';

export class TopicService {
  async getTopics(): Promise<TopicDto[]> {
    // Mock implementation - replace with actual API call
    const categories = [...new Set(mockVocabulary.map(v => v.category))];
    
    return categories.map(category => {
      const categoryWords = mockVocabulary.filter(v => v.category === category);
      const learnedCount = categoryWords.filter(v => v.isLearned).length;
      
      return {
        id: category,
        name: category,
        totalWords: categoryWords.length,
        learnedWords: learnedCount
      };
    });
  }

  async getTopic(id: string): Promise<TopicDto | null> {
    // Mock implementation - replace with actual API call
    const topics = await this.getTopics();
    return topics.find(t => t.id === id) || null;
  }

  async createTopic(dto: CreateTopicDto): Promise<TopicDto> {
    // Mock implementation - replace with actual API call
    return {
      id: Date.now().toString(),
      ...dto,
      totalWords: 0,
      learnedWords: 0
    };
  }

  async updateTopic(id: string, dto: UpdateTopicDto): Promise<TopicDto> {
    // Mock implementation - replace with actual API call
    const topic = await this.getTopic(id);
    if (!topic) {
      throw new Error('Topic not found');
    }

    return {
      ...topic,
      ...dto
    };
  }

  async deleteTopic(id: string): Promise<void> {
    // Mock implementation - replace with actual API call
    return Promise.resolve();
  }
}

export const topicService = new TopicService();
