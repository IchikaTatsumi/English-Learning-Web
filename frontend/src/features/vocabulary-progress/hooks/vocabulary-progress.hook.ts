import { useState, useCallback } from 'react';
import { vocabularyProgressService } from '../services/vocabulary-progress.service';
import {
  SubmitPracticeDto,
  BookmarkVocabDto,
  VocabularyProgressStatsDto,
  LearnedVocabularyDto,
} from '../dtos/vocabulary-progress.dto';

export function useVocabularyProgress() {
  const [learnedVocabularies, setLearnedVocabularies] = useState<LearnedVocabularyDto[]>([]);
  const [bookmarkedVocabularies, setBookmarkedVocabularies] = useState<LearnedVocabularyDto[]>([]);
  const [progressStats, setProgressStats] = useState<VocabularyProgressStatsDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitPractice = useCallback(async (dto: SubmitPracticeDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const stats = await vocabularyProgressService.submitPractice(dto);
      setProgressStats(stats);
      return stats;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit practice');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleBookmark = useCallback(async (dto: BookmarkVocabDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const stats = await vocabularyProgressService.toggleBookmark(dto);
      setProgressStats(stats);
      return stats;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle bookmark');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchLearnedVocabularies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await vocabularyProgressService.getLearnedVocabularies();
      setLearnedVocabularies(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch learned vocabularies');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchBookmarkedVocabularies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await vocabularyProgressService.getBookmarkedVocabularies();
      setBookmarkedVocabularies(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookmarked vocabularies');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchProgressStats = useCallback(async (vocabId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const stats = await vocabularyProgressService.getProgressStats(vocabId);
      setProgressStats(stats);
      return stats;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch progress stats');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    learnedVocabularies,
    bookmarkedVocabularies,
    progressStats,
    isLoading,
    error,
    submitPractice,
    toggleBookmark,
    fetchLearnedVocabularies,
    fetchBookmarkedVocabularies,
    fetchProgressStats,
  };
}

export function useVocabProgressStats(vocabId: number) {
  const [stats, setStats] = useState<VocabularyProgressStatsDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await vocabularyProgressService.getProgressStats(vocabId);
      setStats(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [vocabId]);

  return {
    stats,
    isLoading,
    error,
    fetchStats,
  };
}