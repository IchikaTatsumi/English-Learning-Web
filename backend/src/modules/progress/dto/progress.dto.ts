import { AutoExpose } from 'src/core/decorators/auto-expose.decorator';
import { BaseResponseDto } from 'src/core/dto/base.dto';
import { ApiProperty } from '@nestjs/swagger';

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

// ✅ FIX: Tách riêng WeeklyActivityDto
export class WeeklyActivityDto {
  @ApiProperty()
  day: string;

  @ApiProperty()
  count: number;
}

// ✅ FIX: Tách riêng LearningTrendDto
export class LearningTrendDto {
  @ApiProperty()
  date: string;

  @ApiProperty()
  score: number;
}

@AutoExpose()
export class ProgressStatsDTO extends BaseResponseDto {
  @ApiProperty()
  totalWords: number;

  @ApiProperty()
  learnedWords: number;

  @ApiProperty()
  currentStreak: number;

  @ApiProperty()
  quizScore: number;

  @ApiProperty()
  overallProgress: number;

  @ApiProperty()
  weeklyGoalProgress: number;

  @ApiProperty()
  longestStreak: number;

  @ApiProperty()
  totalQuizzes: number;

  @ApiProperty({ type: [WeeklyActivityDto] }) //  FIX: Dùng type: []
  weeklyActivity: WeeklyActivityDto[];

  @ApiProperty({ type: [LearningTrendDto] }) //  FIX: Dùng type: []
  learningTrends: LearningTrendDto[];
}
