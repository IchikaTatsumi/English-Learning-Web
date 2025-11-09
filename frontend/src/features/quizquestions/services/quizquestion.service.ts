import {
  CreateQuizQuestionDto,
  QuizQuestionResponseDto,
} from '../dtos/quizquestion.dto';

export class QuizQuestionService {
  private baseUrl = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:4000/api';

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  /**
   * Get random questions for practice
   * GET /quiz-questions/random?count=10
   */
  async getRandomQuestions(count: number = 10): Promise<QuizQuestionResponseDto[]> {
    try {
      const response = await fetch(`${this.baseUrl}/quiz-questions/random?count=${count}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch random questions');

      return await response.json();
    } catch (error) {
      console.error('Error fetching random questions:', error);
      throw error;
    }
  }

  /**
   * Get question by ID
   * GET /quiz-questions/:id
   */
  async getQuestionById(questionId: number): Promise<QuizQuestionResponseDto> {
    try {
      const response = await fetch(`${this.baseUrl}/quiz-questions/${questionId}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch question');

      return await response.json();
    } catch (error) {
      console.error('Error fetching question:', error);
      throw error;
    }
  }

  /**
   * Create new question (Admin only)
   * POST /quiz-questions
   */
  async createQuestion(dto: CreateQuizQuestionDto): Promise<QuizQuestionResponseDto> {
    try {
      const response = await fetch(`${this.baseUrl}/quiz-questions`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(dto),
      });

      if (!response.ok) throw new Error('Failed to create question');

      return await response.json();
    } catch (error) {
      console.error('Error creating question:', error);
      throw error;
    }
  }

  /**
   * Delete question (Admin only)
   * DELETE /quiz-questions/:id
   */
  async deleteQuestion(questionId: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/quiz-questions/${questionId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to delete question');
    } catch (error) {
      console.error('Error deleting question:', error);
      throw error;
    }
  }
}

export const quizQuestionService = new QuizQuestionService();