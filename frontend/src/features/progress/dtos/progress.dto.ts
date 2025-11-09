export interface ProgressResponseDto {
  id: number;
  user_id: number;
  total_quizzes: number;
  total_questions: number;
  correct_answers: number;
  accuracy_rate: number;
  created_at: string;
}

export interface ProgressStatsDto {
  total_words: number;
  learned_words: number;
  current_streak: number;
  quiz_score: number;
  overall_progress: number;
  weekly_goal_progress: number;
  longest_streak: number;
  total_quizzes: number;
  weekly_activity: Array<{
    day: string;
    count: number;
  }>;
  learning_trends: Array<{
    date: string;
    score: number;
  }>;
}