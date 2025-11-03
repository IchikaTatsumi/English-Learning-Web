export interface TopicDto {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  totalWords: number;
  learnedWords: number;
}

export interface CreateTopicDto {
  name: string;
  description?: string;
  icon?: string;
}

export interface UpdateTopicDto {
  name?: string;
  description?: string;
  icon?: string;
}
