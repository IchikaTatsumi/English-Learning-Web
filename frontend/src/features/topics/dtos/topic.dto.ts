// src/features/topics/dtos/topic.dto.ts
export interface TopicDto {
  id: number; // topic_id
  name: string; // topic_name
  description?: string;
  totalWords: number; // Sẽ được tính từ vocabularies
  learnedWords: number; // Sẽ được tính từ progress
}

export interface CreateTopicDto {
  name: string;
  description?: string;
}

export interface UpdateTopicDto {
  name?: string;
  description?: string;
}