import { UserProgressDto, VocabProgressDto, TopicProgressDto, DailyProgressDto } from '../dtos/progress.dto';

export class ProgressService {
  private baseUrl = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:3000/api';

  async getUserProgress(userId: number): Promise<UserProgressDto> {
    try {
      const response = await fetch(`${this.baseUrl}/progress/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user progress');
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching user progress:', error);
      // Return mock data
      return this.getMockUserProgress(userId);
    }
  }

  async getVocabProgress(userId: number, vocabId?: number): Promise<VocabProgressDto[]> {
    try {
      const url = vocabId 
        ? `${this.baseUrl}/progress/vocab/${userId}/${vocabId}`
        : `${this.baseUrl}/progress/vocab/${userId}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch vocab progress');
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching vocab progress:', error);
      return [];
    }
  }

  async getTopicProgress(userId: number): Promise<TopicProgressDto[]> {
    try {
      const response = await fetch(`${this.baseUrl}/progress/topics/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch topic progress');
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching topic progress:', error);
      return [];
    }
  }

  async getDailyProgress(userId: number, days: number = 7): Promise<DailyProgressDto[]> {
    try {
      const response = await fetch(`${this.baseUrl}/progress/daily/${userId}?days=${days}`);
      if (!response.ok) throw new Error('Failed to fetch daily progress');
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching daily progress:', error);
      return [];
    }
  }

  // Mock data
  private getMockUserProgress(userId: number): UserProgressDto {
    return {
      user_id: userId,
      total_quizzes: 15,
      total_questions: 75,
      correct_answers: 60,
      accuracy_rate: 80,
      total_words_learned: 45,
      current_streak: 5,
      longest_streak: 12,
      last_quiz_date: new Date().toISOString(),
      created_at: '2024-01-01T00:00:00Z',
      updated_at: new Date().toISOString(),
    };
  }
}

export const progressService = new ProgressService();