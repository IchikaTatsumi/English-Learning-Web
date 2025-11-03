export interface UserProgressDto {
  userId: string;
  totalWords: number;
  learnedWords: number;
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
  topicId: string;
  topicName: string;
  totalWords: number;
  learnedWords: number;
  accuracy: number;
}
