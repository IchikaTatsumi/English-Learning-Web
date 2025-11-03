export interface VocabularyDto {
  id: string;
  word: string;
  pronunciation: string;
  partOfSpeech: string;
  definition: string;
  example: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  topicId: string;
  isLearned: boolean;
  dateAdded: string;
  lastReviewed?: string;
}

export interface CreateVocabularyDto {
  word: string;
  pronunciation: string;
  partOfSpeech: string;
  definition: string;
  example: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  topicId: string;
}

export interface UpdateVocabularyDto {
  word?: string;
  pronunciation?: string;
  partOfSpeech?: string;
  definition?: string;
  example?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  topicId?: string;
  isLearned?: boolean;
}

export interface VocabularyFilterDto {
  topicId?: string;
  difficulty?: string;
  isLearned?: boolean;
  searchTerm?: string;
}
