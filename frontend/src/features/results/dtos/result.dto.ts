export interface CreateResultDto {
  quiz_id: number;
  quiz_question_id: number;
  // ✅ ADDED: user_id (backend may get from auth, but DTO allows it)
  user_id?: number;
  user_answer?: string;
  user_speech_text?: string;
  is_correct: boolean;
}

export interface ResultResponseDto {
  result_id: number;
  quiz_id: number;
  quiz_question_id: number;
  user_id: number;
  user_answer: string;
  user_speech_text: string;
  is_correct: boolean;
  created_at: string;
  quiz_question?: {
    quiz_question_id: number;
    question_text: string;
    correct_answer: string;
    question_type: string;
    vocabulary: {
      word: string;
      meaning_en: string;
      meaning_vi: string;
    };
  };
}

export interface QuizResultSummaryDto {
  quiz_id: number;
  total_questions: number;
  correct_answers: number;
  score: number;
  completed_at: string;
  results: {
    question_id: number;
    question_text: string;
    user_answer: string;
    correct_answer: string;
    is_correct: boolean;
    word: string;
  }[];
}

export interface UserStatisticsDto {
  total_questions: number;
  correct_answers: number;
  accuracy: number;
}

export interface VocabResultDto {
  result_id: number;
  quiz_id: number;
  quiz_question_id: number;
  user_id: number;
  user_answer: string;
  is_correct: boolean;
  created_at: string;
}

export interface VocabBestScoreDto {
  score: number;
}