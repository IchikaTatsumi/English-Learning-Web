export interface CreateQuizQuestionDto {
  vocab_id: number;
  question_type: 'WordToMeaning' | 'MeaningToWord' | 'VietnameseToWord' | 'Pronunciation';
  question_text: string;
  correct_answer: string;
  time_limit?: number;
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

export interface AnswerQuizQuestionDto {
  user_answer: string;
  speech_text?: string;
}

export interface QuestionResultDto {
  question_id: number;
  is_correct: boolean;
  user_answer: string;
  correct_answer: string;
  explanation?: string;
}