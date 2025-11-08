export interface UserProgressDto {
  user_id: number;
  total_quizzes: number;
  total_questions: number;
  correct_answers: number;
  accuracy_rate: number;
  total_words_learned: number;
  current_streak: number;
  longest_streak: number;
  last_quiz_date?: string;
  created_at: string;
  updated_at: string;
}

export interface VocabProgressDto {
  vocab_id: number;
  user_id: number;
  total_answered: number;
  total_correct: number;
  accuracy_percent: number;
  last_attempted?: string;
}

export interface TopicProgressDto {
  topic_id: number;
  topic_name: string;
  total_words: number;
  learned_words: number;
  accuracy_rate: number;
}

export interface DailyProgressDto {
  date: string;
  words_learned: number;
  quizzes_taken: number;
  correct_answers: number;
  time_spent: number;
}