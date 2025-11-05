// src/features/results/hooks/result.hook.ts
'use client';

import { useState, useCallback } from 'react';
import { resultService } from '../services/result.service';
import { QuizResultDto, ResultSummaryDto } from '../dto/result.dto';

export function useResults(userId: number) { // Đã thay đổi userId: string -> number
  const [results, setResults] = useState<QuizResultDto[]>([]);
  const [summary, setSummary] = useState<ResultSummaryDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Giữ nguyên hàm cũ để tương thích với UI hiện tại, nhưng nên dùng getUserPronunciationResults
      const data = await resultService.getUserResults(userId.toString());
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
      // Giữ nguyên hàm cũ để tương thích với UI hiện tại
      const data = await resultService.getResultSummary(userId.toString());
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