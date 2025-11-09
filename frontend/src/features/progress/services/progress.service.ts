export interface ProgressResponseDto {
  id: number;
  user_id: number;
  total_quizzes: number;
  total_questions: number;
  correct_answers: number;
  accuracy_rate: number;
  created_at: string;
}

export interface ProgressStatsDto {
  total_words: number;
  learned_words: number;
  current_streak: number;
  quiz_score: number;
  overall_progress: number;
  weekly_goal_progress: number;
  longest_streak: number;
  total_quizzes: number;
  weekly_activity: Array<{
    day: string;
    count: number;
  }>;
  learning_trends: Array<{
    date: string;
    score: number;
  }>;
}

// ============================================
// Service
// ============================================

export class ProgressService {
  private baseUrl = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:4000/api';

  private getAuthHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  /**
   * Get user progress
   * GET /progress
   * Backend: ProgressController.getUserProgress()
   */
  async getUserProgress(): Promise<ProgressResponseDto> {
    try {
      const response = await fetch(`${this.baseUrl}/progress`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user progress');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user progress:', error);
      throw error;
    }
  }

  /**
   * Get detailed progress statistics
   * GET /progress/stats
   * Backend: ProgressController.getProgressStats()
   */
  async getProgressStats(): Promise<ProgressStatsDto> {
    try {
      const response = await fetch(`${this.baseUrl}/progress/stats`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch progress statistics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching progress statistics:', error);
      throw error;
    }
  }
}

export const progressService = new ProgressService();