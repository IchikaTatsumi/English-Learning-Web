'use client';

import { useState, useCallback } from 'react';
import { progressService } from '../services/progress.service';
import { ProgressResponseDto, ProgressStatsDto } from '../dtos/progress.dto';

/**
 * ✅ FIXED: Hook takes no parameters by default
 */
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

/**
 * ✅ ADDED: Hook for vocabulary progress (specific to a user)
 */
export function useVocabProgress(userId: number) {
  const [vocabProgress, setVocabProgress] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVocabProgress = useCallback(async () => {
    if (!userId) return null;
    
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Implement backend endpoint for vocab progress
      // For now, return mock data or use general progress
      const data = await progressService.getUserProgress();
      setVocabProgress(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch vocab progress';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  return {
    vocabProgress,
    isLoading,
    error,
    fetchVocabProgress,
  };
}