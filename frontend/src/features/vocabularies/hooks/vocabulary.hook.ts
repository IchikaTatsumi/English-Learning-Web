'use client';

import { useState, useCallback, useEffect } from 'react';
import { vocabularyService } from '../services/vocabulary.service';
import { 
  VocabularyDto, 
  VocabularyFilterDto, 
  CreateVocabularyDto, 
  UpdateVocabularyDto,
  VocabularyListResponseDto
} from '../dtos/vocabulary.dto';

export function useVocabularies(initialFilters?: VocabularyFilterDto) {
  const [vocabularies, setVocabularies] = useState<VocabularyDto[]>([]);
  const [listResponse, setListResponse] = useState<VocabularyListResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch vocabularies with filters
   */
  const fetchVocabularies = useCallback(async (filters?: VocabularyFilterDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await vocabularyService.getVocabularies(filters);
      if (response.success && response.data) {
        setListResponse(response.data);
        setVocabularies(response.data.data);
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

  /**
   * Fetch all vocabularies (no filters)
   */
  const fetchAllVocabularies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await vocabularyService.getAllVocabularies();
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

  /**
   * Create vocabulary (Admin only)
   */
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

  /**
   * Update vocabulary (Admin only)
   */
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

  /**
   * Delete vocabulary (Admin only)
   */
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
    listResponse,
    isLoading,
    error,
    fetchVocabularies,
    fetchAllVocabularies,
    createVocabulary,
    updateVocabulary,
    deleteVocabulary,
  };
}

/**
 * Hook for single vocabulary operations
 */
export function useVocabulary(id?: number) {
  const [vocabulary, setVocabulary] = useState<VocabularyDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVocabulary = useCallback(async (vocabId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await vocabularyService.getVocabularyById(vocabId);
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
  }, []);

  useEffect(() => {
    if (id) {
      fetchVocabulary(id);
    }
  }, [id, fetchVocabulary]);

  return {
    vocabulary,
    isLoading,
    error,
    fetchVocabulary,
  };
}

/**
 * Hook for vocabulary search
 */
export function useVocabularySearch() {
  const [searchResults, setSearchResults] = useState<VocabularyDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchVocabularies = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await vocabularyService.searchVocabularies(query);
      setSearchResults(results);
      return results;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to search vocabularies';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    searchResults,
    isLoading,
    error,
    searchVocabularies,
  };
}

/**
 * Hook for vocabularies by topic
 */
export function useVocabulariesByTopic(topicId?: number) {
  const [vocabularies, setVocabularies] = useState<VocabularyDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVocabularies = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await vocabularyService.getVocabulariesByTopic(id);
      setVocabularies(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch vocabularies';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (topicId) {
      fetchVocabularies(topicId);
    }
  }, [topicId, fetchVocabularies]);

  return {
    vocabularies,
    isLoading,
    error,
    fetchVocabularies,
  };
}

/**
 * Hook for random vocabularies
 */
export function useRandomVocabularies() {
  const [vocabularies, setVocabularies] = useState<VocabularyDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRandomVocabularies = useCallback(async (count: number = 10, difficulty?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await vocabularyService.getRandomVocabularies(count, difficulty);
      setVocabularies(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch random vocabularies';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    vocabularies,
    isLoading,
    error,
    fetchRandomVocabularies,
  };
}