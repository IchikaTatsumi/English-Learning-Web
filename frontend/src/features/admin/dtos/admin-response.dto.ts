export interface DashboardStatsDto {
  totalUsers: number;
  totalTopics: number;
  totalVocabularies: number;
  totalQuizzes: number;
}

export interface RecentActivityDto {
  recentUsers: any[];
  recentTopics: any[];
  recentVocabularies: any[];
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