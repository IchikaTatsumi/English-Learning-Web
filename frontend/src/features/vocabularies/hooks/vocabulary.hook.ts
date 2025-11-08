'use client';

import { useState, useCallback } from 'react';
import { vocabularyService } from '../services/vocabulary.service';
import { VocabularyDto, VocabularyFilterDto, CreateVocabularyDto, UpdateVocabularyDto } from '../dtos/vocabulary.dto';

export function useVocabularies(filters?: VocabularyFilterDto) {
  const [vocabularies, setVocabularies] = useState<VocabularyDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVocabularies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await vocabularyService.getVocabularies(filters);
      setVocabularies(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch vocabularies';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const createVocabulary = useCallback(async (dto: CreateVocabularyDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const newVocab = await vocabularyService.createVocabulary(dto);
      setVocabularies(prev => [...prev, newVocab]);
      return newVocab;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create vocabulary';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateVocabulary = useCallback(async (id: number, dto: UpdateVocabularyDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await vocabularyService.updateVocabulary(id, dto);
      setVocabularies(prev => prev.map(v => v.vocab_id === id ? updated : v));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update vocabulary';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteVocabulary = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await vocabularyService.deleteVocabulary(id);
      setVocabularies(prev => prev.filter(v => v.vocab_id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete vocabulary';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleBookmark = useCallback(async (vocabId: number, isBookmarked: boolean) => {
    setError(null);
    try {
      await vocabularyService.toggleBookmark(vocabId, isBookmarked);
      setVocabularies(prev => prev.map(v => 
        v.vocab_id === vocabId ? { ...v, is_learned: isBookmarked } : v
      ));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to toggle bookmark';
      setError(message);
      throw err;
    }
  }, []);

  return {
    vocabularies,
    isLoading,
    error,
    fetchVocabularies,
    createVocabulary,
    updateVocabulary,
    deleteVocabulary,
    toggleBookmark,
  };
}

export function useVocabulary(id: number) {
  const [vocabulary, setVocabulary] = useState<VocabularyDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVocabulary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await vocabularyService.getVocabularyById(id);
      setVocabulary(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch vocabulary';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  return {
    vocabulary,
    isLoading,
    error,
    fetchVocabulary,
  };
}