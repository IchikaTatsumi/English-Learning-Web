// src/features/results/services/result.service.ts
import { QuizResultDto, ResultSummaryDto, PronunciationResultDto, TopicPerformanceDto } from '../dtos/result.dto';
import { mockProgress, mockTopics, mockResults } from '@/data/mockData';

export class ResultService {
  // Hàm mới: Lấy kết quả luyện phát âm
  async getPronunciationResult(resultId: number): Promise<PronunciationResultDto | null> {
    // Mock implementation - replace with actual API call
    return mockResults.find(r => r.id === resultId) || null;
  }
  
  // Dành cho lịch sử luyện tập phát âm
  async getUserPronunciationResults(userId: number): Promise<PronunciationResultDto[]> {
    // Mock implementation - replace with actual API call
    return mockResults.filter(r => r.userId === userId);
  }
  
  // Hàm cũ: Giữ lại cho UI cũ nếu cần
  async getQuizResult(resultId: string): Promise<QuizResultDto | null> {
    // Mock implementation - replace with actual API call
    return {
      id: resultId,
      quizId: 'quiz-1',
      userId: 'user-1',
      score: 4,
      totalQuestions: 5,
      percentage: 80,
      timeSpent: 120,
      completedAt: new Date().toISOString(),
      answers: []
    };
  }

  async getUserResults(userId: string): Promise<QuizResultDto[]> {
    // Mock implementation - replace with actual API call
    return [];
  }

  async getResultSummary(userId: string): Promise<ResultSummaryDto> {
    // Mock implementation - replace with actual API call
    const topicsPerformance: TopicPerformanceDto[] = mockTopics.map(topic => ({
      topicId: topic.id,
      topicName: topic.name,
      quizzesTaken: Math.floor(Math.random() * 5) + 1,
      averageScore: Math.round(Math.random() * 20 + 70)
    }));

    return {
      totalQuizzes: mockProgress.totalQuizzes,
      averageScore: mockProgress.averageScore,
      bestScore: mockProgress.bestScore,
      totalTimeSpent: mockProgress.totalTimeSpent,
      topicsPerformance: topicsPerformance
    };
  }
}

export const resultService = new ResultService();