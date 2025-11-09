export interface DashboardStatsDto {
  totalUsers: number;
  totalTopics: number;
  totalVocabularies: number;
  totalQuizzes: number;
}

export interface RecentActivityDto {
  recentUsers: UserActivityDto[];
  recentTopics: TopicActivityDto[];
  recentVocabularies: VocabularyActivityDto[];
}

export interface UserActivityDto {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: 'Admin' | 'User';
  createdAt: string;
}

export interface TopicActivityDto {
  id: number;
  topicName: string;
  description?: string;
  createdAt: string;
  vocabularyCount?: number;
}

export interface VocabularyActivityDto {
  id: number;
  word: string;
  difficultyLevel: string;
  createdAt: string;
  topicName?: string;
}

export interface AdminAccessDto {
  isAdmin: boolean;
  user?: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

// Re-export response DTOs
export * from './admin-response.dto';