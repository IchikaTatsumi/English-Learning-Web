'use client';

import { useState, useCallback } from 'react';
import { resultService } from '../services/result.service';
import { QuizResultDto, ResultSummaryDto } from '../dtos/result.dto';

export function useResults(userId: string) {
  const [results, setResults] = useState<QuizResultDto[]>([]);
  const [summary, setSummary] = useState<ResultSummaryDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await resultService.getUserResults(userId);
      setResults(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch results');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await resultService.getResultSummary(userId);
      setSummary(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch summary');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  return {
    results,
    summary,
    fetchResults,
    fetchSummary,
    isLoading,
    error
  };
}
