import { AutoExpose } from 'src/core/decorators/auto-expose.decorator';
import { BaseResponseDto } from 'src/core/dto/base.dto';

@AutoExpose()
export class ProgressResponseDto extends BaseResponseDto {
  id: number;
  userId: number;
  totalQuizzes: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracyRate: number;
  createdAt: Date;
}

@AutoExpose()
export class ProgressStatsDTO extends BaseResponseDto {
  totalWords: number;
  learnedWords: number;
  currentStreak: number;
  quizScore: number;
  overallProgress: number;
  weeklyGoalProgress: number;
  longestStreak: number;
  totalQuizzes: number;
  weeklyActivity: Array<{ day: string; count: number }>;
  learningTrends: Array<{ date: string; score: number }>;
}

@AutoExpose()
export class WeeklyActivityDto extends BaseResponseDto {
  day: string;
  count: number;
}

@AutoExpose()
export class LearningTrendDto extends BaseResponseDto {
  date: string;
  score: number;
}
