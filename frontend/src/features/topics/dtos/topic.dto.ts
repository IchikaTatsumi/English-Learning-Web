export interface TopicDto {
  topic_id: number;
  topic_name: string;
  description?: string;
  created_at: string;
  vocabularies?: VocabularyInTopicDto[];
}

export interface VocabularyInTopicDto {
  vocab_id: number;
  word: string;
  difficulty_level: string;
}

export interface CreateTopicDto {
  topic_name: string;
  description?: string;
}

export interface UpdateTopicDto {
  topic_name?: string;
  description?: string;
}

/**
 * Topic search result for autocomplete/dropdown
 * Backend: GET /topics/search
 */
export interface TopicSearchResultDto {
  id: number;
  topic_name: string;
  description: string | null;
  vocabulary_count: number;
  learned_count?: number; // Only if user authenticated
}

/**
 * Topic search query params
 */
export interface TopicSearchDto {
  q?: string;
  limit?: number;
}

/**
 * Topic list response (for filters)
 * Backend: GET /topics/list
 */
export interface TopicListResponseDto {
  topics: TopicSearchResultDto[];
  total: number;
}

/**
 * Topic with learning progress
 * Backend: GET /topics/progress
 */
export interface TopicProgressDto {
  id: number;
  topic_name: string;
  description: string;
  created_at: string;
  total_words: number;
  learned_count: number;
  progress_percentage?: number;
}