import { DifficultyLevel } from '@/lib/constants/enums';

export interface VocabularyDto {
  vocab_id: number;
  topic_id: number;
  word: string;
  ipa?: string;
  meaning_en: string;
  meaning_vi: string;
  example_sentence?: string;
  audio_path?: string;
  difficulty_level: DifficultyLevel;
  created_at: string;
  // ✅ ADDED: Topic name for display
  topic_name?: string;
  // ✅ ADDED: Learning status
  is_learned?: boolean;
  is_bookmarked?: boolean;
  topic?: {
    topic_id: number;
    topic_name: string;
    description?: string;
  };
}

export interface CreateVocabularyDto {
  topic_id: number;
  word: string;
  ipa?: string;
  meaning_en: string;
  meaning_vi: string;
  example_sentence?: string;
  audio_path?: string;
  difficulty_level: DifficultyLevel;
}

export interface UpdateVocabularyDto {
  topic_id?: number;
  word?: string;
  ipa?: string;
  meaning_en?: string;
  meaning_vi?: string;
  example_sentence?: string;
  audio_path?: string;
  difficulty_level?: DifficultyLevel;
}

/**
 * Filter DTO for vocabulary list
 * Backend: GET /vocabularies/filter
 */
export interface VocabularyFilterDto {
  search?: string;
  // ✅ FIXED: Change difficulty to match DifficultyLevel enum
  difficulty?: DifficultyLevel | 'all';
  topic_id?: number;
  only_learned?: boolean;
  recently_learned?: boolean;
  view_mode?: 'List' | 'Grid';
  paginate?: boolean;
  page?: number;
  limit?: number;
  sort_by?: 'word' | 'created_at' | 'difficulty_level' | 'first_learned_at';
  sort_order?: 'ASC' | 'DESC';
  // ✅ ADDED: Search term alias
  searchTerm?: string;
  // ✅ ADDED: Is learned filter
  isLearned?: boolean;
  // ✅ ADDED: Difficulty level filter
  difficulty_level?: DifficultyLevel | 'all';
}

/**
 * Response for filtered vocabulary list
 */
export interface VocabularyListResponseDto {
  data: VocabularyDto[];
  view_mode: 'List' | 'Grid';
  total: number;
  paginated: boolean;
  page?: number;
  limit?: number;
  total_pages?: number;
  filters?: {
    search?: string;
    difficulty?: DifficultyLevel;
    topic_id?: number;
    only_learned?: boolean;
    recently_learned?: boolean;
  };
}

/**
 * Vocabulary with learning progress
 */
export interface VocabularyWithProgressDto extends VocabularyDto {
  is_learned: boolean;
  is_bookmarked: boolean;
  first_learned_at?: string;
  last_reviewed_at?: string;
  practice_attempts: number;
  practice_correct_count: number;
  accuracy: number;
}