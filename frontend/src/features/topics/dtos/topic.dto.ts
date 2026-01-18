export interface VocabularyInTopicDto {
  vocab_id: number;
  word: string;
  difficulty_level: string;
}

export interface TopicDto {
  topic_id: number;
  topic_name: string;
  description?: string;
  created_at: string;
  vocab_count?: number; 
  vocabulary_count?: number; 
  vocabularies?: VocabularyInTopicDto[];
}

// ✅ SỬA: Đổi sang camelCase để khớp với Validation Backend
export interface CreateTopicDto {
  topicName: string; 
  description?: string;
}

// ✅ SỬA: Đổi sang camelCase
export interface UpdateTopicDto {
  topicName?: string;
  description?: string;
}

export interface TopicSearchResultDto {
  topic_id: number;
  topic_name: string;
  description: string | null;
  vocabulary_count: number;
  learned_count?: number; 
}

export interface TopicSearchDto {
  q?: string;
  limit?: number;
}

export interface TopicListResponseDto {
  topics: TopicSearchResultDto[];
  total: number;
}

export interface TopicProgressDto {
  topic_id: number;
  topic_name: string;
  description: string;
  created_at: string;
  total_words: number;
  learned_count: number;
  progress_percentage?: number;
}