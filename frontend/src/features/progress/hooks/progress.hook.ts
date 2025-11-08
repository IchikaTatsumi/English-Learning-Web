'use client';

import { useState, useCallback } from 'react';
import { progressService } from '../services/progress.service';
import { UserProgressDto, VocabProgressDto, TopicProgressDto, DailyProgressDto } from '../dtos/progress.dto';

export function useProgress(userId: number) {
  const [progress, setProgress] = useState<UserProgressDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!userId) return null;
    
    setIsLoading(true);
    setError(null);
    try {
      const data = await progressService.getUserProgress(userId);
      setProgress(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch progress';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  return {
    progress,
    isLoading,
    error,
    fetchProgress,
  };
}

export function useVocabProgress(userId: number, vocabId?: number) {
  const [vocabProgress, setVocabProgress] = useState<VocabProgressDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVocabProgress = useCallback(async () => {
    if (!userId) return [];
    
    setIsLoading(true);
    setError(null);
    try {
      const data = await progressService.getVocabProgress(userId, vocabId);
      setVocabProgress(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch vocab progress';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId, vocabId]);

  return {
    vocabProgress,
    isLoading,
    error,
    fetchVocabProgress,
  };
}

export function useTopicProgress(userId: number) {
  const [topicProgress, setTopicProgress] = useState<TopicProgressDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTopicProgress = useCallback(async () => {
    if (!userId) return [];
    
    setIsLoading(true);
    setError(null);
    try {
      const data = await progressService.getTopicProgress(userId);
      setTopicProgress(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch topic progress';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  return {
    topicProgress,
    isLoading,
    error,
    fetchTopicProgress,
  };
}

export function useDailyProgress(userId: number, days: number = 7) {
  const [dailyProgress, setDailyProgress] = useState<DailyProgressDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDailyProgress = useCallback(async () => {
    if (!userId) return [];
    
    setIsLoading(true);
    setError(null);
    try {
      const data = await progressService.getDailyProgress(userId, days);
      setDailyProgress(data);
      return data;