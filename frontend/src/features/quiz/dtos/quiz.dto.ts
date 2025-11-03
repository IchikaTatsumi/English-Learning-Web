export interface QuizDto {
  id: string;
  title: string;
  topicId?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  questionCount: number;
  timeLimit?: number;
  createdAt: string;
}

export interface QuizQuestionDto {
  id: string;
  quizId: string;
  type: 'multiple-choice' | 'fill-blank' | 'definition-match';
  question: string;
  options?: string[];
  correctAnswer: string;
  vocabularyId: string;
}

export interface QuizAttemptDto {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  timeSpent: number;
  completedAt: string;
}

export interface CreateQuizDto {
  title: string;
  topicId?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  questionCount: number;
  timeLimit?: number;
}

export interface SubmitQuizAnswerDto {
  questionId: string;
  answer: string;
}
