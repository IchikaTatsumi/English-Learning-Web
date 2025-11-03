// src/features/progress/services/progress.service.ts
import { UserProgressDto, DailyProgressDto, ProgressStatsDto } from '../dtos/progress.dto';
import { mockProgress, mockTopics, updateMockVocabulary } from '@/data/mockData';

export class ProgressService {
  async getUserProgress(userId: number): Promise<UserProgressDto> {
    // Mock implementation - replace with actual API call
    return {
      userId,
      totalWords: mockProgress.totalWords,
      learnedWords: mockProgress.correctWords, // Ánh xạ từ DB
      currentStreak: mockProgress.currentStreak,
      longestStreak: mockProgress.longestStreak,
      totalQuizzes: mockProgress.totalQuizzes,
      correctAnswers: mockProgress.correctAnswers,
      weeklyGoal: mockProgress.weeklyGoal,
    };
  }

  async getDailyProgress(userId: number, days: number = 7): Promise<DailyProgressDto[]> {
    // Mock implementation - replace with actual API call
    return mockProgress.dailyProgress;
  }

  async getProgressStats(userId: number): Promise<ProgressStatsDto> {
    // Mock implementation - replace with actual API call
    const userProgress = await this.getUserProgress(userId);
    const dailyProgress = await this.getDailyProgress(userId);

    const topicProgress: ProgressStatsDto['topicProgress'] = mockTopics.map(topic => ({
        topicId: topic.id,
        topicName: topic.name,
        totalWords: topic.totalWords,
        learnedWords: topic.learnedWords,
        accuracy: Math.round(Math.random() * 20 + 70)
    }));

    return {
      userProgress,
      dailyProgress,
      topicProgress: topicProgress
    };
  }

  async updateWeeklyGoal(userId: number, goal: number): Promise<UserProgressDto> {
    // Mock implementation - update mockProgress và trả về
    // Trong môi trường thực tế, bạn sẽ gọi API
    mockProgress.weeklyGoal = goal;
    const current = await this.getUserProgress(userId);
    return current;
  }
}

export const progressService = new ProgressService();