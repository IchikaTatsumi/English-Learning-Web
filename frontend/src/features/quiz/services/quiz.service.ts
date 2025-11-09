import { 
  CreateQuizDto, 
  QuizResponseDto, 
  SubmitQuizDto, 
  QuizResultDto,
  QuizStatisticsDto,
  QuizQuestionResponseDto 
} from '../dtos/quiz.dto';

export class QuizService {
  private baseUrl = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:4000/api';

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  /**
   * Create a new quiz
   * POST /quiz
   */
  async createQuiz(dto: CreateQuizDto): Promise<QuizResponseDto> {
    try {
      const response = await fetch(`${this.baseUrl}/quiz`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(dto),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create quiz');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating quiz:', error);
      throw error;
    }
  }

  /**
   * Get all user quizzes
   * GET /quiz
   */
  async getUserQuizzes(): Promise<QuizResponseDto[]> {
    try {
      const response = await fetch(`${this.baseUrl}/quiz`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch quizzes');

      return await response.json();
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      throw error;
    }
  }

  /**
   * Get quiz by ID
   * GET /quiz/:id
   */
  async getQuizById(quizId: number): Promise<QuizResponseDto> {
    try {
      const response = await fetch(`${this.baseUrl}/quiz/${quizId}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch quiz');

      return await response.json();
    } catch (error) {
      console.error('Error fetching quiz:', error);
      throw error;
    }
  }

  /**
   * Submit quiz answers
   * POST /quiz/:id/submit
   */
  async submitQuiz(quizId: number, dto: SubmitQuizDto): Promise<QuizResultDto> {
    try {
      const response = await fetch(`${this.baseUrl}/quiz/${quizId}/submit`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(dto),
      });

      if (!response.ok) throw new Error('Failed to submit quiz');

      return await response.json();
    } catch (error) {
      console.error('Error submitting quiz:', error);
      throw error;
    }
  }

  /**
   * Get quiz statistics
   * GET /quiz/statistics
   */
  async getQuizStatistics(): Promise<QuizStatisticsDto> {
    try {
      const response = await fetch(`${this.baseUrl}/quiz/statistics`, {
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
   * Delete a quiz
   * DELETE /quiz/:id
   */
  async deleteQuiz(quizId: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/quiz/${quizId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to delete quiz');
    } catch (error) {
      console.error('Error deleting quiz:', error);
      throw error;
    }
  }

  /**
   * Get random quiz questions for practice
   * GET /quiz-questions/random?count=10
   */
  async getRandomQuestions(count: number = 10): Promise<QuizQuestionResponseDto[]> {
    try {
      const response = await fetch(`${this.baseUrl}/quiz-questions/random?count=${count}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch questions');

      return await response.json();
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
  }

  /**
   * Get quiz question by ID
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
}

export const quizService = new QuizService();