export interface TopicDto {
  topic_id: number;
  topic_name: string;
  description?: string;
  vocab_count?: number;
  created_at?: string;
}

export interface CreateTopicDto {
  topic_name: string;
  description?: string;
}

export interface UpdateTopicDto {
  topic_name?: string;
  description?: string;
}