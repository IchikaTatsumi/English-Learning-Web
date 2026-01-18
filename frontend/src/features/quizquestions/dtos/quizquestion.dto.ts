export enum QuestionType {
  WordToMeaning = 'WordToMeaning',
  MeaningToWord = 'MeaningToWord',
  VietnameseToWord = 'VietnameseToWord',
  Pronunciation = 'Pronunciation',
  SentenceToWord = 'SentenceToWord',
  SpeechToWord = 'SpeechToWord' 
}

export interface QuizQuestionDto {
  quiz_question_id: number;
  vocab_id: number;
  question_type: QuestionType; 
  question_text: string;
  correct_answer: string;
  time_limit?: number;
}

// ✅ Thêm DTO tạo mới nếu chưa có
export interface CreateQuizQuestionDto {
  vocabId: number;        // Input form thường dùng camelCase
  questionType: string;
  questionText: string;
  correctAnswer: string;
  incorrectAnswers: string[];
  timeLimit?: number;
}