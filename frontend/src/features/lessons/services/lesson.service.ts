import { LessonDto, CreateLessonDto, UpdateLessonDto, LessonProgressDto } from '../dtos/lesson.dto';

export class LessonService {
  async getLessons(topicId?: string): Promise<LessonDto[]> {
    // Mock implementation - replace with actual API call
    return [
      {
        id: '1',
        title: 'Introduction to Animals',
        description: 'Learn basic animal vocabulary',
        topicId: 'Animals',
        level: 'beginner',
        vocabularyCount: 5,
        duration: 15,
        isCompleted: false
      },
      {
        id: '2',
        title: 'Nature Basics',
        description: 'Essential nature-related words',
        topicId: 'Nature',
        level: 'beginner',
        vocabularyCount: 5,
        duration: 15,
        isCompleted: false
      }
    ].filter(l => !topicId || l.topicId === topicId);
  }

  async getLesson(id: string): Promise<LessonDto | null> {
    // Mock implementation - replace with actual API call
    const lessons = await this.getLessons();
    return lessons.find(l => l.id === id) || null;
  }

  async createLesson(dto: CreateLessonDto): Promise<LessonDto> {
    // Mock implementation - replace with actual API call
    return {
      id: Date.now().toString(),
      title: dto.title,
      description: dto.description,
      topicId: dto.topicId,
      level: dto.level,
      vocabularyCount: dto.vocabularyIds.length,
      duration: dto.vocabularyIds.length * 3,
      isCompleted: false
    };
  }

  async updateLesson(id: string, dto: UpdateLessonDto): Promise<LessonDto> {
    // Mock implementation - replace with actual API call
    const lesson = await this.getLesson(id);
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    return {
      ...lesson,
      ...dto,
      vocabularyCount: dto.vocabularyIds?.length || lesson.vocabularyCount
    };
  }

  async deleteLesson(id: string): Promise<void> {
    // Mock implementation - replace with actual API call
    return Promise.resolve();
  }

  async getLessonProgress(lessonId: string, userId: string): Promise<LessonProgressDto> {
    // Mock implementation - replace with actual API call
    return {
      lessonId,
      userId,
      completedWords: [],
      totalWords: 5,
      progressPercentage: 0
    };
  }

  async markLessonComplete(lessonId: string, userId: string): Promise<void> {
    // Mock implementation - replace with actual API call
    return Promise.resolve();
  }
}

export const lessonService = new LessonService();
