// ✅ 1. Input DTO (Gửi lên Backend) - Dùng camelCase theo chuẩn DTO NestJS
export interface CreateQuizDto {
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Mixed Levels';
  totalQuestions: number;
  topicId?: number;
}

// ✅ 2. Output DTO (Nhận từ Backend) - Dùng snake_case theo chuẩn Database Entity
export interface QuizResponseDto {
  quiz_id: number;
  user_id: number;
  difficulty_mode: string; // Database trả về snake_case
  total_questions: number;
  score: number;
  created_at: string;
  results?: ResultResponseDto[];
}

// ✅ 3. Question DTO
export interface QuizQuestionResponseDto {
  quiz_question_id: number;
  vocab_id: number;
  question_type: 'WordToMeaning' | 'MeaningToWord' | 'VietnameseToWord' | 'Pronunciation' | 'SentenceToWord';
  question_text: string;
  correct_answer: string;
  // Mảng chứa các đáp án sai từ DB (snake_case)
  incorrect_answers?: string[]; 
  // Mảng chứa tất cả options đã trộn để hiển thị UI (Frontend tự tạo hoặc Backend trả về)
  options?: string[];
  time_limit: number;
  created_at: string;
  // Thông tin từ vựng liên quan
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

// Alias cho tương thích ngược nếu cần
export type QuizQuestionDto = QuizQuestionResponseDto;

// ✅ 4. Submission DTOs
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

// ✅ 5. Statistics & Result DTOs
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