'use client';

import { useState, useCallback } from 'react';
import { vocabularyService } from '../services/vocabulary.service';
import { VocabularyDto, VocabularyFilterDto } from '../dtos/vocabulary.dto';

export function useVocabularies(filter?: VocabularyFilterDto) {
  const [vocabularies, setVocabularies] = useState<VocabularyDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVocabularies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await vocabularyService.getVocabularies(filter);
      setVocabularies(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vocabularies');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  const markAsLearned = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await vocabularyService.markAsLearned(id);
      setVocabularies(prev => prev.map(v => v.id === id ? updated : v));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as learned');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    vocabularies,
    fetchVocabularies,
    markAsLearned,
    isLoading,
    error
  };
}
