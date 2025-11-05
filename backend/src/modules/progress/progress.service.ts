import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Progress } from './entities/progress.entity';
import { Result } from '../results/entities/result.entity';
import { Vocabulary } from '../vocabularies/entities/vocabulary.entity';
import { ProgressStatsDTO } from './dto/progress.dto';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(Progress)
    private progressRepository: Repository<Progress>,
    @InjectRepository(Result)
    private resultRepository: Repository<Result>,
    @InjectRepository(Vocabulary)
    private vocabularyRepository: Repository<Vocabulary>,
  ) {}

  async getOrCreateProgress(userId: number): Promise<Progress> {
    let progress = await this.progressRepository.findOne({
      where: { userId },
    });

    if (!progress) {
      progress = this.progressRepository.create({ userId });
      progress = await this.progressRepository.save(progress);
    }

    return progress;
  }

  async updateProgress(userId: number): Promise<Progress> {
    const progress = await this.getOrCreateProgress(userId);

    // Get all results for user
    const results = await this.resultRepository.find({
      where: { userId },
      relations: ['quizQuestion'],
    });

    // Update basic stats
    progress.totalQuestions = results.length;
    progress.correctAnswers = results.filter((r) => r.isCorrect).length;

    if (progress.totalQuestions > 0) {
      progress.accuracyRate = parseFloat(
        ((progress.correctAnswers / progress.totalQuestions) * 100).toFixed(2),
      );
    }

    // Calculate total quizzes (unique quiz_id count)
    const uniqueQuizIds = new Set(results.map((r) => r.quizId));
    progress.totalQuizzes = uniqueQuizIds.size;

    return await this.progressRepository.save(progress);
  }

  async getProgressStats(userId: number): Promise<ProgressStatsDTO> {
    await this.updateProgress(userId);
    const progress = await this.getOrCreateProgress(userId);

    const results = await this.resultRepository.find({
      where: { userId },
      relations: ['quizQuestion'],
      order: { createdAt: 'DESC' },
    });

    // Calculate total words in system
    const totalWords = await this.vocabularyRepository.count();

    // Calculate learned words (unique vocab with score >= 80)
    const vocabResults = new Map<number, boolean[]>();

    for (const result of results) {
      const vocabId = result.quizQuestion.vocabId;
      if (!vocabResults.has(vocabId)) {
        vocabResults.set(vocabId, []);
      }
      vocabResults.get(vocabId)!.push(result.isCorrect);
    }

    let learnedWords = 0;
    // ✅ FIX: Thêm underscore để báo ESLint biết vocabId không được dùng
    for (const [_vocabId, attempts] of vocabResults.entries()) {
      const correctCount = attempts.filter((a) => a).length;
      const score = (correctCount / attempts.length) * 100;
      if (score >= 80) {
        learnedWords++;
      }
    }

    // Calculate streaks
    const currentStreak = await this.calculateStreak(userId);
    const longestStreak = await this.calculateLongestStreak(userId);

    // Weekly activity
    const weeklyActivity = await this.getWeeklyActivity(userId);

    // Learning trends
    const learningTrends = await this.getLearningTrends(userId);

    // Calculate quiz score
    const quizScore = progress.accuracyRate;

    // Weekly goal progress (assume goal is 15 words per week)
    const weeklyGoal = 15;
    const thisWeekCount = weeklyActivity.reduce(
      (sum, day) => sum + day.count,
      0,
    );
    const weeklyGoalProgress = Math.min(
      Math.round((thisWeekCount / weeklyGoal) * 100),
      100,
    );

    return {
      totalWords,
      learnedWords,
      currentStreak,
      quizScore: Math.round(quizScore),
      overallProgress: Math.round(
        (learnedWords / Math.max(totalWords, 1)) * 100,
      ),
      weeklyGoalProgress,
      longestStreak,
      totalQuizzes: progress.totalQuizzes,
      weeklyActivity,
      learningTrends,
    };
  }

  private async calculateStreak(userId: number): Promise<number> {
    const results = await this.resultRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    if (results.length === 0) return 0;

    let streak = 0;
    // ✅ FIX: Đổi let thành const
    const currentDate = new Date();
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

  private async calculateLongestStreak(userId: number): Promise<number> {
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
    userId: number,
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
      const dayIndex = (result.createdAt.getDay() + 6) % 7;
      const day = daysOfWeek[dayIndex];
      activityByDay.set(day, (activityByDay.get(day) || 0) + 1);
    });

    return daysOfWeek.map((day) => ({
      day,
      count: activityByDay.get(day) || 0,
    }));
  }

  private async getLearningTrends(
    userId: number,
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
      // Convert isCorrect to score (100 or 0)
      const score = result.isCorrect ? 100 : 0;
      scoresByDate.get(dateStr)!.push(score);
    });

    const trends = Array.from(scoresByDate.entries()).map(([date, scores]) => ({
      date,
      score: Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length),
    }));

    return trends;
  }
}
