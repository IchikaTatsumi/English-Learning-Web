import {
  TopicDto,
  CreateTopicDto,
  UpdateTopicDto,
  TopicSearchDto,
  TopicSearchResultDto,
  TopicListResponseDto,
  TopicProgressDto,
} from '../dtos/topic.dto';

export class TopicService {
  private baseUrl = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:4000/api';

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  /**
   * Get all topics
   * GET /topics
   */
  async getTopics(): Promise<TopicDto[]> {
    try {
      const response = await fetch(`${this.baseUrl}/topics`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch topics');

      const topics: any[] = await response.json();
      
      // ✅ Map dữ liệu trả về để khớp với DTO Frontend
      // Backend (sau khi sửa DTO) sẽ trả về 'vocabulary_count'
      return topics.map(topic => ({
        topic_id: topic.topic_id || topic.id,
        topic_name: topic.topic_name || topic.topicName,
        description: topic.description,
        created_at: topic.created_at || topic.createdAt,
        // Ưu tiên 'vocabulary_count' từ DTO Backend, fallback về 0
        vocabulary_count: topic.vocabulary_count || 0,
        vocabularies: topic.vocabularies || [] // Giữ lại mảng con nếu có
      }));
    } catch (error) {
      console.error('Error fetching topics:', error);
      throw error;
    }
  }

  // ... (Các method khác giữ nguyên không đổi)
  
  async getTopicById(id: number): Promise<TopicDto> {
    try {
      const response = await fetch(`${this.baseUrl}/topics/${id}`, {
        headers: this.getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch topic');
      return await response.json();
    } catch (error) {
      console.error('Error fetching topic:', error);
      throw error;
    }
  }

  async searchTopics(dto?: TopicSearchDto): Promise<TopicSearchResultDto[]> {
    try {
      const params = new URLSearchParams();
      if (dto?.q) params.append('q', dto.q);
      if (dto?.limit) params.append('limit', dto.limit.toString());

      const response = await fetch(`${this.baseUrl}/topics/search?${params.toString()}`, {
        headers: this.getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to search topics');
      return await response.json();
    } catch (error) {
      console.error('Error searching topics:', error);
      throw error;
    }
  }

  async getTopicsForFilter(): Promise<TopicListResponseDto> {
    try {
      const response = await fetch(`${this.baseUrl}/topics/list`, {
        headers: this.getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch topics for filter');
      return await response.json() as TopicListResponseDto;
    } catch (error) {
      console.error('Error fetching topics for filter:', error);
      throw error;
    }
  }

  async getTopicsWithProgress(): Promise<TopicProgressDto[]> {
    try {
      const response = await fetch(`${this.baseUrl}/topics/progress`, {
        headers: this.getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch topics with progress');
      const topics = await response.json();
      return topics.map((topic: TopicProgressDto) => ({
        ...topic,
        progress_percentage: topic.total_words > 0 
          ? Math.round((topic.learned_count / topic.total_words) * 100)
          : 0
      }));
    } catch (error) {
      console.error('Error fetching topics with progress:', error);
      throw error;
    }
  }

  async createTopic(dto: CreateTopicDto): Promise<TopicDto> {
    try {
      const response = await fetch(`${this.baseUrl}/topics`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(dto),
      });
      if (!response.ok) throw new Error('Failed to create topic');
      return await response.json();
    } catch (error) {
      console.error('Error creating topic:', error);
      throw error;
    }
  }

  async updateTopic(id: number, dto: UpdateTopicDto): Promise<TopicDto> {
    try {
      const response = await fetch(`${this.baseUrl}/topics/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(dto),
      });
      if (!response.ok) throw new Error('Failed to update topic');
      return await response.json();
    } catch (error) {
      console.error('Error updating topic:', error);
      throw error;
    }
  }

  async deleteTopic(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/topics/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to delete topic');
    } catch (error) {
      console.error('Error deleting topic:', error);
      throw error;
    }
  }
}

export const topicService = new TopicService();