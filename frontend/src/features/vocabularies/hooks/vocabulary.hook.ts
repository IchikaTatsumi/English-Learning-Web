'use client';

import { useState, useCallback, useEffect } from 'react';
import { vocabularyService } from '../services/vocabulary.service';
import { VocabularyDto, VocabularyFilterDto, CreateVocabularyDto, UpdateVocabularyDto } from '../dtos/vocabulary.dto';

export function useVocabularies(initialFilters?: VocabularyFilterDto) {
  const [vocabularies, setVocabularies] = useState<VocabularyDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVocabularies = useCallback(async (filters?: VocabularyFilterDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await vocabularyService.getVocabularies(filters);
      if (response.success && response.data) {
        setVocabularies(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch vocabularies');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch vocabularies';
      setError(message);
      setVocabularies([]);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createVocabulary = useCallback(async (dto: CreateVocabularyDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await vocabularyService.createVocabulary(dto);
      if (response.success && response.data) {
        setVocabularies(prev => [...prev, response.data!]);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create vocabulary');
      }
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
      const response = await vocabularyService.updateVocabulary(id, dto);
      if (response.success && response.data) {
        setVocabularies(prev => prev.map(v => v.vocab_id === id ? response.data! : v));
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update vocabulary');
      }
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
      const response = await vocabularyService.deleteVocabulary(id);
      if (response.success) {
        setVocabularies(prev => prev.filter(v => v.vocab_id !== id));
      } else {
        throw new Error(response.message || 'Failed to delete vocabulary');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete vocabulary';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-fetch on mount if filters provided
  useEffect(() => {
    if (initialFilters) {
      fetchVocabularies(initialFilters);
    }
  }, [initialFilters, fetchVocabularies]);

  return {
    vocabularies,
    isLoading,
    error,
    fetchVocabularies,
    createVocabulary,
    updateVocabulary,
    deleteVocabulary,
  };
}

export function useVocabulary(id: number) {
  const [vocabulary, setVocabulary] = useState<VocabularyDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVocabulary = useCallback(async () => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await vocabularyService.getVocabularyById(id);
      if (response.success && response.data) {
        setVocabulary(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch vocabulary');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch vocabulary';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchVocabulary();
  }, [fetchVocabulary]);

  return {
    vocabulary,
    isLoading,
    error,
    fetchVocabulary,
  };
}