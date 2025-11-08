import { TopicDto, CreateTopicDto, UpdateTopicDto } from '../dtos/topic.dto';

export class TopicService {
  private baseUrl = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:3000/api';

  async getTopics(): Promise<TopicDto[]> {
    try {
      const response = await fetch(`${this.baseUrl}/topics`);
      if (!response.ok) throw new Error('Failed to fetch topics');
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching topics:', error);
      // Return mock data for development
      return this.getMockTopics();
    }
  }

  async getTopicById(id: number): Promise<TopicDto> {
    try {
      const response = await fetch(`${this.baseUrl}/topics/${id}`);
      if (!response.ok) throw new Error('Failed to fetch topic');
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching topic:', error);
      throw error;
    }
  }

  async createTopic(dto: CreateTopicDto): Promise<TopicDto> {
    try {
      const response = await fetch(`${this.baseUrl}/topics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });
      
      if (!response.ok) throw new Error('Failed to create topic');
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error creating topic:', error);
      throw error;
    }
  }

  async updateTopic(id: number, dto: UpdateTopicDto): Promise<TopicDto> {
    try {
      const response = await fetch(`${this.baseUrl}/topics/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });
      
      if (!response.ok) throw new Error('Failed to update topic');
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error updating topic:', error);
      throw error;
    }
  }

  async deleteTopic(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/topics/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete topic');
    } catch (error) {
      console.error('Error deleting topic:', error);
      throw error;
    }
  }

  // Mock data for development
  private getMockTopics(): TopicDto[] {
    return [
      {
        topic_id: 1,
        topic_name: 'Greetings',
        description: 'Common greetings and introductions',
        vocab_count: 15,
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        topic_id: 2,
        topic_name: 'Nature',
        description: 'Words related to nature and environment',
        vocab_count: 25,
        created_at: '2024-01-02T00:00:00Z'
      },
      {
        topic_id: 3,
        topic_name: 'Technology',
        description: 'Technology and computer terms',
        vocab_count: 30,
        created_at: '2024-01-03T00:00:00Z'
      },
      {
        topic_id: 4,
        topic_name: 'Food',
        description: 'Food and cooking vocabulary',
        vocab_count: 40,
        created_at: '2024-01-04T00:00:00Z'
      },
      {
        topic_id: 5,
        topic_name: 'Weather',
        description: 'Weather conditions and climate',
        vocab_count: 20,
        created_at: '2024-01-05T00:00:00Z'
      },
      {
        topic_id: 6,
        topic_name: 'Daily Activities',
        description: 'Common daily routines and activities',
        vocab_count: 35,
        created_at: '2024-01-06T00:00:00Z'
      },
    ];
  }
}

export const topicService = new TopicService();