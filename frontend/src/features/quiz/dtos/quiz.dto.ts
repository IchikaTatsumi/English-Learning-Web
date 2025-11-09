export interface CreateQuizDto {
  difficulty_level: 'Beginner Only' | 'Intermediate Only' | 'Advanced Only' | 'Mixed Levels';
  total_questions?: number;
  topic_id?: number;
}

export interface QuizResponseDto {
  quiz_id: number;
  user_id: number;
  difficulty_mode: string;
  total_questions: number;
  score: number;
  created_at: string;
  results?: ResultResponseDto[];
}

export interface QuizQuestionResponseDto {
  quiz_question_id: number;
  vocab_id: number;
  question_type: 'WordToMeaning' | 'MeaningToWord' | 'VietnameseToWord' | 'Pronunciation';
  question_text: string;
  correct_answer: string;
  time_limit: number;
  created_at: string;
  vocabulary?: {
    vocab_id: number;
    word: string;
    meaning_en: string;
    meaning_vi: string;
    ipa: string;
    difficulty_level: string;
    topic: {
      topic_id: number;
      topic_name: string;
    };
  };
}

export interface AnswerQuestionDto {
  question_id: number;
  answer: string;
  speech_text?: string;
}

export interface SubmitQuizDto {
  answers: AnswerQuestionDto[];
}

export interface QuizResultDto {
  quiz_id: number;
  total_questions: number;
  correct_answers: number;
  score: number;
  completed_at: string;
  questions: {
    question_id: number;
    question_text: string;
    user_answer: string;
    correct_answer: string;
    is_correct: boolean;
    word: string;
  }[];
}

export interface QuizStatisticsDto {
  total_quizzes: number;
  average_score: number;
  total_questions_answered: number;
  correct_answers: number;
  accuracy: number;
  best_score: number;
  recent_quizzes: QuizResponseDto[];
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
  quiz_question?: QuizQuestionResponseDto;
}