export interface QuizResultDto {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpent: number;
  completedAt: string;
  answers: QuizAnswerDto[];
}

export interface QuizAnswerDto {
  questionId: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  vocabularyId: string;
}

export interface ResultSummaryDto {
  totalQuizzes: number;
  averageScore: number;
  bestScore: number;
  totalTimeSpent: number;
  topicsPerformance: TopicPerformanceDto[];
}

export interface TopicPerformanceDto {
  topicId: string;
  topicName: string;
  quizzesTaken: number;
  averageScore: number;
}
