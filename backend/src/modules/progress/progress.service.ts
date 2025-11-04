import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Progress } from './entities/progress.entity';
import { Result } from '../results/entities/result.entity';
import { ProgressStatsDTO } from './dtos/progress.dto';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(Progress)
    private progressRepository: Repository<Progress>,
    @InjectRepository(Result)
    private resultRepository: Repository<Result>,
  ) {}

  async getOrCreateProgress(userId: string): Promise<Progress> {
    let progress = await this.progressRepository.findOne({
      where: { userId },
    });

    if (!progress) {
      progress = this.progressRepository.create({ userId });
      progress = await this.progressRepository.save(progress);
    }

    return progress;
  }

  async updateProgress(userId: string): Promise<Progress> {
    const progress = await this.getOrCreateProgress(userId);

    const results = await this.resultRepository.find({
      where: { userId },
    });

    // Calculate unique words attempted
    const uniqueVocabIds = new Set(results.map((r) => r.vocabId));
    progress.totalWords = uniqueVocabIds.size;

    // Calculate correct words (score >= 80)
    const correctWords = new Set();
    for (const vocabId of uniqueVocabIds) {
      const vocabResults = results.filter((r) => r.vocabId === vocabId);
      const bestScore = Math.max(...vocabResults.map((r) => r.score));
      if (bestScore >= 80) {
        correctWords.add(vocabId);
      }
    }
    progress.correctWords = correctWords.size;

    // Calculate average score
    if (results.length > 0) {
      const totalScore = results.reduce((sum, r) => sum + r.score, 0);
      progress.avgScore = totalScore / results.length;
    }

    return await this.progressRepository.save(progress);
  }

  async getProgressStats(userId: string): Promise<ProgressStatsDTO> {
    await this.updateProgress(userId);
    const progress = await this.getOrCreateProgress(userId);

    const results = await this.resultRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    // Calculate current streak
    const currentStreak = await this.calculateStreak(userId);

    // Calculate longest streak
    const longestStreak = await this.calculateLongestStreak(userId);

    // Weekly activity (last 7 days)
    const weeklyActivity = await this.getWeeklyActivity(userId);

    // Learning trends (last 30 days)
    const learningTrends = await this.getLearningTrends(userId);

    // Calculate quiz score (average of all quiz attempts)
    const quizScore = progress.avgScore;

    // Weekly goal progress (assume goal is 15 words per week)
    const weeklyGoal = 15;
    const thisWeekCount = weeklyActivity.reduce(
      (sum, day) => sum + day.count,
      0,
    );
    const weeklyGoalProgress = Math.round((thisWeekCount / weeklyGoal) * 100);

    return {
      totalWords: progress.totalWords,
      learnedWords: progress.correctWords,
      currentStreak,
      quizScore: Math.round(quizScore),
      overallProgress: Math.round(
        (progress.correctWords / Math.max(progress.totalWords, 1)) * 100,
      ),
      weeklyGoalProgress: Math.min(weeklyGoalProgress, 100),
      longestStreak,
      totalQuizzes: results.length,
      weeklyActivity,
      learningTrends,
    };
  }

  private async calculateStreak(userId: string): Promise<number> {
    const results = await this.resultRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    if (results.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const uniqueDates = new Set<string>();
    results.forEach((r) => {
      const dateStr = r.createdAt.toISOString().split('T')[0];
      uniqueDates.add(dateStr);
    });

    const sortedDates = Array.from(uniqueDates).sort().reverse();

    for (const dateStr of sortedDates) {
      const resultDate = new Date(dateStr);
      const daysDiff = Math.floor(
        (currentDate.getTime() - resultDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysDiff === streak) {
        streak++;
      } else if (daysDiff > streak) {
        break;
      }
    }

    return streak;
  }

  private async calculateLongestStreak(userId: string): Promise<number> {
    const results = await this.resultRepository.find({
      where: { userId },
      order: { createdAt: 'ASC' },
    });

    if (results.length === 0) return 0;

    const uniqueDates = new Set<string>();
    results.forEach((r) => {
      const dateStr = r.createdAt.toISOString().split('T')[0];
      uniqueDates.add(dateStr);
    });

    const sortedDates = Array.from(uniqueDates).sort();
    let longestStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const daysDiff = Math.floor(
        (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysDiff === 1) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return longestStreak;
  }

  private async getWeeklyActivity(
    userId: string,
  ): Promise<Array<{ day: string; count: number }>> {
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const results = await this.resultRepository.find({
      where: {
        userId,
        createdAt: MoreThanOrEqual(weekAgo),
      },
    });

    const activityByDay = new Map<string, number>();
    daysOfWeek.forEach((day) => activityByDay.set(day, 0));

    results.forEach((result) => {
      const dayIndex = (result.createdAt.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
      const day = daysOfWeek[dayIndex];
      activityByDay.set(day, (activityByDay.get(day) || 0) + 1);
    });

    return daysOfWeek.map((day) => ({
      day,
      count: activityByDay.get(day) || 0,
    }));
  }

  private async getLearningTrends(
    userId: string,
  ): Promise<Array<{ date: string; score: number }>> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const results = await this.resultRepository.find({
      where: {
        userId,
        createdAt: MoreThanOrEqual(thirtyDaysAgo),
      },
      order: { createdAt: 'ASC' },
    });

    const scoresByDate = new Map<string, number[]>();

    results.forEach((result) => {
      const dateStr = result.createdAt.toISOString().split('T')[0];
      if (!scoresByDate.has(dateStr)) {
        scoresByDate.set(dateStr, []);
      }
      scoresByDate.get(dateStr)!.push(result.score);
    });

    const trends = Array.from(scoresByDate.entries()).map(([date, scores]) => ({
      date,
      score: scores.reduce((sum, s) => sum + s, 0) / scores.length,
    }));

    return trends;
  }
}
