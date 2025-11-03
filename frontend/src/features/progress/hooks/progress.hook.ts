// src/features/progress/hooks/progress.hook.ts
'use client';

import { useState, useCallback } from 'react';
import { progressService } from '../services/progress.service';
import { UserProgressDto, ProgressStatsDto } from '../dtos/progress.dto';

export function useProgress(userId: number) { // Đã thay đổi userId: string -> number
  const [progress, setProgress] = useState<UserProgressDto | null>(null);
  const [stats, setStats] = useState<ProgressStatsDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await progressService.getUserProgress(userId);
      setProgress(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch progress');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await progressService.getProgressStats(userId);
      setStats(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  return {
    progress,
    stats,
    fetchProgress,
    fetchStats,
    isLoading,
    error
  };
}