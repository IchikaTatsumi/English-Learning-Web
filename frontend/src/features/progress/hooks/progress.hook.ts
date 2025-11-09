'use client';

import { useState, useCallback } from 'react';
import { progressService } from '../services/progress.service';
import { ProgressResponseDto, ProgressStatsDto } from '../dtos/progress.dto';

export function useProgress() {
  const [progress, setProgress] = useState<ProgressResponseDto | null>(null);
  const [stats, setStats] = useState<ProgressStatsDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await progressService.getUserProgress();
      setProgress(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch progress';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await progressService.getProgressStats();
      setStats(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch stats';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    progress,
    stats,
    isLoading,
    error,
    fetchProgress,
    fetchStats,
  };
}