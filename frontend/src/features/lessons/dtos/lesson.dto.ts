export interface LessonDto {
  id: string;
  title: string;
  description: string;
  topicId: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  vocabularyCount: number;
  duration: number; // in minutes
  isCompleted: boolean;
  completedAt?: string;
}

export interface CreateLessonDto {
  title: string;
  description: string;
  topicId: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  vocabularyIds: string[];
}

export interface UpdateLessonDto {
  title?: string;
  description?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  vocabularyIds?: string[];
}

export interface LessonProgressDto {
  lessonId: string;
  userId: string;
  completedWords: string[];
  totalWords: number;
  progressPercentage: number;
  lastStudiedAt?: string;
}
