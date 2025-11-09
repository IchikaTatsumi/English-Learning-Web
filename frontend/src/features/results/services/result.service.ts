import {
  CreateResultDto,
  ResultResponseDto,
  UserStatisticsDto,
  VocabResultDto,
  VocabBestScoreDto,
} from '../dtos/result.dto';

export class ResultService {
  private baseUrl = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:4000/api';

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  /**
   * Get all results for current user
   * GET /results
   */
  async getUserResults(): Promise<ResultResponseDto[]> {
    try {
      const response = await fetch(`${this.baseUrl}/results`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch results');

      return await response.json();
    } catch (error) {
      console.error('Error fetching results:', error);
      throw error;
    }
  }

  /**
   * Get recent results
   * GET /results/recent?limit=10
   */
  async getRecentResults(limit: number = 10): Promise<ResultResponseDto[]> {
    try {
      const response = await fetch(`${this.baseUrl}/results/recent?limit=${limit}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch recent results');

      return await response.json();
    } catch (error) {
      console.error('Error fetching recent results:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   * GET /results/statistics
   */
  async getUserStatistics(): Promise<UserStatisticsDto> {
    try {
      const response = await fetch(`${this.baseUrl}/results/statistics`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch statistics');

      return await response.json();
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  }

  /**
   * Get results for specific quiz
   * GET /results/quiz/:quizId
   */
  async getResultsByQuiz(quizId: number): Promise<ResultResponseDto[]> {
    try {
      const response = await fetch(`${this.baseUrl}/results/quiz/${quizId}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch quiz results');

      return await response.json();
    } catch (error) {
      console.error('Error fetching quiz results:', error);
      throw error;
    }
  }

  /**
   * Get results for specific vocabulary
   * GET /results/vocabulary/:vocabId
   */
  async getResultsByVocab(vocabId: number): Promise<VocabResultDto[]> {
    try {
      const response = await fetch(`${this.baseUrl}/results/vocabulary/${vocabId}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch vocab results');

      return await response.json();
    } catch (error) {
      console.error('Error fetching vocab results:', error);
      throw error;
    }
  }

  /**
   * Get best score for vocabulary
   * GET /results/vocabulary/:vocabId/best-score
   */
  async getBestScoreForVocab(vocabId: number): Promise<VocabBestScoreDto> {
    try {
      const response = await fetch(`${this.baseUrl}/results/vocabulary/${vocabId}/best-score`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch best score');

      return await response.json();
    } catch (error) {
      console.error('Error fetching best score:', error);
      throw error;
    }
  }

  /**
   * Create a new result
   * POST /results
   */
  async createResult(dto: CreateResultDto): Promise<ResultResponseDto> {
    try {
      const response = await fetch(`${this.baseUrl}/results`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(dto),
      });

      if (!response.ok) throw new Error('Failed to create result');

      return await response.json();
    } catch (error) {
      console.error('Error creating result:', error);
      throw error;
    }
  }
}

export const resultService = new ResultService();