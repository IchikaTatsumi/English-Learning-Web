'use client';

import { useState, useCallback } from 'react';
import { resultService } from '../services/result.service';
import {
  CreateResultDto,
  ResultResponseDto,
  UserStatisticsDto,
  VocabResultDto,
  VocabBestScoreDto,
} from '../dtos/result.dto';

export function useResults() {
  const [results, setResults] = useState<ResultResponseDto[]>([]);
  const [recentResults, setRecentResults] = useState<ResultResponseDto[]>([]);
  const [statistics, setStatistics] = useState<UserStatisticsDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all user results
   */
  const fetchUserResults = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await resultService.getUserResults();
      setResults(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch results');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch recent results
   */
  const fetchRecentResults = useCallback(async (limit: number = 10) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await resultService.getRecentResults(limit);
      setRecentResults(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recent results');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch user statistics
   */
  const fetchStatistics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await resultService.getUserStatistics();
      setStatistics(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create new result
   */
  const createResult = useCallback(async (dto: CreateResultDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await resultService.createResult(dto);
      setResults(prev => [...prev, result]);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create result');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    results,
    recentResults,
    statistics,
    isLoading,
    error,
    fetchUserResults,
    fetchRecentResults,
    fetchStatistics,
    createResult,
  };
}

/**
 * Hook for quiz-specific results
 */
export function useQuizResults(quizId?: number) {
  const [results, setResults] = useState<ResultResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await resultService.getResultsByQuiz(id);
      setResults(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch results');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    results,
    isLoading,
    error,
    fetchResults,
  };
}

/**
 * Hook for vocabulary-specific results
 */
export function useVocabResults(vocabId?: number) {
  const [results, setResults] = useState<VocabResultDto[]>([]);
  const [bestScore, setBestScore] = useState<VocabBestScoreDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch results for vocabulary
   */
  const fetchResults = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await resultService.getResultsByVocab(id);
      setResults(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch results');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch best score for vocabulary
   */
  const fetchBestScore = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await resultService.getBestScoreForVocab(id);
      setBestScore(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch best score');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    results,
    bestScore,
    isLoading,
    error,
    fetchResults,
    fetchBestScore,
  };
}