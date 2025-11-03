// src/features/vocabularies/dtos/vocabulary.dto.ts
export interface VocabularyDto {
  id: number; // vocab_id
  word: string;
  pronunciation: string; // ipa
  partOfSpeech: string; // Cần thêm từ database hoặc mock
  definition: string; // meaning
  example: string; // Cần thêm từ database hoặc mock
  difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1'; // level
  topicId: number; // Sẽ được thêm vào để dễ lọc
  lessonId: number;
  isLearned: boolean; // Sẽ tính từ bảng `results`
  dateAdded: string; // created_at
  lastReviewed?: string; // Dựa trên `results.created_at` mới nhất
}

export interface CreateVocabularyDto {
  word: string;
  pronunciation: string;
  partOfSpeech: string;
  definition: string;
  example: string;
  difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  lessonId: number;
}

export interface UpdateVocabularyDto {
  word?: string;
  pronunciation?: string;
  partOfSpeech?: string;
  definition?: string;
  example?: string;
  difficulty?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  lessonId?: number;
  isLearned?: boolean;
}

export interface VocabularyFilterDto {
  topicId?: number;
  difficulty?: string;
  isLearned?: boolean;
  searchTerm?: string;
}