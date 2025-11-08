import { QuizDto, QuizQuestionDto, CreateQuizDto, SubmitQuizAnswerDto } from '../dtos/quiz.dto';

export class QuizService {
  private baseUrl = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:4000/api';

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  async createQuiz(dto: CreateQuizDto): Promise<any> {
    try {
      // Backend API: POST /quiz
      const response = await fetch(`${this.baseUrl}/quiz`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          difficulty_level: dto.difficulty || 'Mixed Levels',
          total_questions: dto.questionCount || 10,
          topic_id: dto.topicId
        }),
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

  async getQuiz(id: string): Promise<QuizDto> {
    try {
      // Backend API: GET /quiz/:id
      const response = await fetch(`${this.baseUrl}/quiz/${id}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch quiz');

      const data = await response.json();
      return this.mapQuizBackendToDto(data);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      throw error;
    }
  }

  async getUserQuizzes(): Promise<QuizDto[]> {
    try {
      // Backend API: GET /quiz
      const response = await fetch(`${this.baseUrl}/quiz`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch quizzes');

      const data = await response.json();
      return data.map((q: any) => this.mapQuizBackendToDto(q));
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      throw error;
    }
  }

  async getQuizQuestions(limit: number = 10): Promise<QuizQuestionDto[]> {
    try {
      // Backend API: GET /quiz-questions/random?count=10
      const response = await fetch(`${this.baseUrl}/quiz-questions/random?count=${limit}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch questions');

      const data = await response.json();
      return data.map((q: any) => this.mapQuestionBackendToDto(q));
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
  }

  async submitQuiz(quizId: string, answers: SubmitQuizAnswerDto[]): Promise<any> {
    try {
      // Backend API: POST /quiz/:id/submit
      const response = await fetch(`${this.baseUrl}/quiz/${quizId}/submit`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          answers: answers.map(a => ({
            question_id: parseInt(a.questionId),
            answer: a.answer
          }))
        }),
      });

      if (!response.ok) throw new Error('Failed to submit quiz');

      return await response.json();
    } catch (error) {
      console.error('Error submitting quiz:', error);
      throw error;
    }
  }

  async getQuizStatistics(): Promise<any> {
    try {
      // Backend API: GET /quiz/statistics
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

  async deleteQuiz(quizId: string): Promise<void> {
    try {
      // Backend API: DELETE /quiz/:id
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

  // Mapping functions
  private mapQuizBackendToDto(data: any): QuizDto {
    return {
      id: data.quiz_id?.toString() || data.id?.toString(),
      title: `Quiz - ${data.difficulty_mode}`,
      difficulty: this.mapDifficulty(data.difficulty_mode),
      questionCount: data.total_questions,
      createdAt: data.created_at
    };
  }

  private mapQuestionBackendToDto(data: any): QuizQuestionDto {
    return {
      id: data.quiz_question_id?.toString() || data.id?.toString(),
      quizId: '',
      type: this.mapQuestionType(data.question_type),
      question: data.question_text,
      options: this.generateOptions(data),
      correctAnswer: data.correct_answer,
      vocabularyId: data.vocab_id?.toString() || ''
    };
  }

  private mapDifficulty(mode: string): 'beginner' | 'intermediate' | 'advanced' {
    if (mode.includes('Beginner')) return 'beginner';
    if (mode.includes('Intermediate')) return 'intermediate';
    if (mode.includes('Advanced')) return 'advanced';
    return 'beginner';
  }

  private mapQuestionType(type: string): 'multiple-choice' | 'fill-blank' | 'definition-match' {
    // All backend questions are multiple choice
    return 'multiple-choice';
  }

  private generateOptions(question: any): string[] {
    // Backend should return options, if not generate mock ones
    if (question.options && Array.isArray(question.options)) {
      return question.options;
    }

    // Generate 4 options including the correct answer
    const options = [question.correct_answer];
    
    // Add 3 random wrong options (in real scenario, backend should provide these)
    if (question.vocabulary?.meaning_en) {
      options.push('Wrong option 1', 'Wrong option 2', 'Wrong option 3');
    }

    return options.sort(() => Math.random() - 0.5);
  }
}

export const quizService = new QuizService();