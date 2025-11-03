// src/features/progress/dtos/progress.dto.ts
export interface UserProgressDto {
  userId: number; // Đã thay đổi
  totalWords: number;
  learnedWords: number; // Ánh xạ từ correct_words
  currentStreak: number;
  longestStreak: number;
  totalQuizzes: number;
  correctAnswers: number;
  weeklyGoal: number;
}

export interface DailyProgressDto {
  date: string;
  wordsLearned: number;
  quizzesTaken: number;
  timeSpent: number;
}

export interface ProgressStatsDto {
  userProgress: UserProgressDto;
  dailyProgress: DailyProgressDto[];
  topicProgress: TopicProgressDto[];
}

export interface TopicProgressDto {
  topicId: number; // Đã thay đổi
  topicName: string;
  totalWords: number;
  learnedWords: number;
  accuracy: number;
}