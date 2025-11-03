import { UserProgressDto, DailyProgressDto, ProgressStatsDto } from '../dtos/progress.dto';
import { mockProgress } from '@/data/mockData';

export class ProgressService {
  async getUserProgress(userId: string): Promise<UserProgressDto> {
    // Mock implementation - replace with actual API call
    return {
      userId,
      ...mockProgress
    };
  }

  async getDailyProgress(userId: string, days: number = 7): Promise<DailyProgressDto[]> {
    // Mock implementation - replace with actual API call
    return mockProgress.dailyProgress.map(dp => ({
      date: dp.date,
      wordsLearned: dp.wordsLearned,
      quizzesTaken: Math.floor(Math.random() * 3),
      timeSpent: Math.floor(Math.random() * 3600)
    }));
  }

  async getProgressStats(userId: string): Promise<ProgressStatsDto> {
    // Mock implementation - replace with actual API call
    const userProgress = await this.getUserProgress(userId);
    const dailyProgress = await this.getDailyProgress(userId);

    return {
      userProgress,
      dailyProgress,
      topicProgress: []
    };
  }

  async updateWeeklyGoal(userId: string, goal: number): Promise<UserProgressDto> {
    // Mock implementation - replace with actual API call
    const current = await this.getUserProgress(userId);
    return {
      ...current,
      weeklyGoal: goal
    };
  }
}

export const progressService = new ProgressService();
