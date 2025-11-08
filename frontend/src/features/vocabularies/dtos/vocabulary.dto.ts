export interface VocabularyDto {
  vocab_id: number;
  word: string;
  ipa: string;
  meaning_en: string;
  meaning_vi: string;
  example_sentence?: string;
  audio_path?: string;
  difficulty_level: 'Beginner' | 'Intermediate' | 'Advanced';
  topic_id: number;
  topic_name: string;
  lesson_id: number;
  is_learned: boolean;
  created_at: string;
}

export interface CreateVocabularyDto {
  word: string;
  ipa: string;
  meaning_en: string;
  meaning_vi: string;
  example_sentence?: string;
  audio_path?: string;
  difficulty_level: 'Beginner' | 'Intermediate' | 'Advanced';
  topic_id: number;
  lesson_id: number;
}

export interface UpdateVocabularyDto {
  word?: string;
  ipa?: string;
  meaning_en?: string;
  meaning_vi?: string;
  example_sentence?: string;
  audio_path?: string;
  difficulty_level?: 'Beginner' | 'Intermediate' | 'Advanced';
  topic_id?: number;
  lesson_id?: number;
}

export interface VocabularyFilterDto {
  topic_id?: number;
  difficulty_level?: 'Beginner' | 'Intermediate' | 'Advanced';
  isLearned?: boolean;
  searchTerm?: string;
}