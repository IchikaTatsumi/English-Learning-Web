'use client';

import { useState, useCallback } from 'react';
import { lessonService } from '../services/lesson.service';
import { LessonDto, LessonProgressDto } from '../dtos/lesson.dto';

export function useLessons(topicId?: string) {
  const [lessons, setLessons] = useState<LessonDto[]>([]);
  const [currentLesson, setCurrentLesson] = useState<LessonDto | null>(null);
  const [progress, setProgress] = useState<LessonProgressDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLessons = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await lessonService.getLessons(topicId);
      setLessons(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch lessons');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [topicId]);

  const fetchLesson = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await lessonService.getLesson(id);
      setCurrentLesson(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch lesson');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchProgress = useCallback(async (lessonId: string, userId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await lessonService.getLessonProgress(lessonId, userId);
      setProgress(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch progress');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    lessons,
    currentLesson,
    progress,
    fetchLessons,
    fetchLesson,
    fetchProgress,
    isLoading,
    error
  };
}
