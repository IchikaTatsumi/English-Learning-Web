// Định nghĩa Enum cho khớp với Backend
export enum QuestionType {
  WordToMeaning = 'WordToMeaning',
  MeaningToWord = 'MeaningToWord',
  VietnameseToWord = 'VietnameseToWord',
  Pronunciation = 'Pronunciation',
  // ✅ Thêm 2 loại mới
  SentenceToWord = 'SentenceToWord',
  SpeechToWord = 'SpeechToWord' 
}

export interface QuizQuestionDto {
  quiz_question_id: number;
  vocab_id: number;
  question_type: QuestionType; // Sử dụng Enum vừa định nghĩa
  question_text: string;
  correct_answer: string;
  time_limit?: number;
}