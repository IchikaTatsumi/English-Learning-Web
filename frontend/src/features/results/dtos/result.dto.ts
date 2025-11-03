// src/features/results/dtos/result.dto.ts
export interface QuizAnswerDto {
  questionId: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  vocabularyId: string;
}

// DTO cho kết quả luyện phát âm (từ bảng 'results')
export interface PronunciationResultDto {
  id: number; // result_id
  userId: number;
  vocabId: number;
  recognizedText: string;
  score: number;
  attemptCount: number;
  audioUserPath?: string;
  createdAt: string; // created_at
}

// Giữ lại QuizResultDto nếu logic Quiz cần (trong ứng dụng hiện tại dùng mock)
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

export interface ResultSummaryDto {
  totalQuizzes: number;
  averageScore: number;
  bestScore: number;
  totalTimeSpent: number;
  topicsPerformance: TopicPerformanceDto[];
}

export interface TopicPerformanceDto {
  topicId: number;
  topicName: string;
  quizzesTaken: number;
  averageScore: number;
}