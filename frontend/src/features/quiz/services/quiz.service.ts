import { QuizDto, QuizQuestionDto, QuizAttemptDto, CreateQuizDto, SubmitQuizAnswerDto } from '../dtos/quiz.dto';
import { mockVocabulary } from '@/data/mockData';

export class QuizService {
  async getQuizzes(): Promise<QuizDto[]> {
    // Mock implementation - replace with actual API call
    return [
      {
        id: '1',
        title: 'General Vocabulary Quiz',
        questionCount: 5,
        timeLimit: 30,
        createdAt: new Date().toISOString()
      }
    ];
  }

  async getQuiz(id: string): Promise<QuizDto | null> {
    // Mock implementation - replace with actual API call
    const quizzes = await this.getQuizzes();
    return quizzes.find(q => q.id === id) || null;
  }

  async generateQuiz(dto: CreateQuizDto): Promise<QuizDto> {
    // Mock implementation - replace with actual API call
    return {
      id: Date.now().toString(),
      ...dto,
      createdAt: new Date().toISOString()
    };
  }

  async getQuizQuestions(quizId: string): Promise<QuizQuestionDto[]> {
    // Mock implementation - replace with actual API call
    const shuffledWords = [...mockVocabulary].sort(() => Math.random() - 0.5).slice(0, 5);
    
    return shuffledWords.map((word, index) => {
      const wrongAnswers = mockVocabulary
        .filter(w => w.id !== word.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(w => w.definition);
      
      const options = [word.definition, ...wrongAnswers].sort(() => Math.random() - 0.5);
      
      return {
        id: `q${index}`,
        quizId,
        type: 'multiple-choice',
        question: `What does "${word.word}" mean?`,
        options,
        correctAnswer: word.definition,
        vocabularyId: word.id
      };
    });
  }

  async submitQuizAttempt(quizId: string, answers: SubmitQuizAnswerDto[]): Promise<QuizAttemptDto> {
    // Mock implementation - replace with actual API call
    return {
      id: Date.now().toString(),
      quizId,
      userId: 'user-1',
      score: 3,
      totalQuestions: 5,
      timeSpent: 120,
      completedAt: new Date().toISOString()
    };
  }
}

export const quizService = new QuizService();
