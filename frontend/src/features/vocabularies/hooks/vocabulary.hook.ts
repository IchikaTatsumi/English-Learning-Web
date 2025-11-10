import { useState, useCallback, useEffect } from 'react';
import { vocabularyService } from '../services/vocabulary.service';
import { 
  VocabularyDto, 
  VocabularyFilterDto, 
  CreateVocabularyDto, 
  UpdateVocabularyDto,
  VocabularyListResponseDto
} from '../dtos/vocabulary.dto';
import { useOptimisticMutation } from '@/lib/hooks/use-optimistic-mutation';
import { toast } from '@/lib/utils/toast';

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
   * Create vocabulary with optimistic update
   */
  const createMutation = useOptimisticMutation({
    mutationFn: async (dto: CreateVocabularyDto) => {
      const response = await vocabularyService.createVocabulary(dto);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to create vocabulary');
      }
      return response.data;
    },
    onMutate: async (dto) => {
      // Optimistically add to list with temporary ID
      const tempVocab: VocabularyDto = {
        vocab_id: -Date.now(), // Temporary negative ID
        topic_id: dto.topic_id,
        word: dto.word,
        ipa: dto.ipa || '',
        meaning_en: dto.meaning_en,
        meaning_vi: dto.meaning_vi,
        example_sentence: dto.example_sentence || '',
        audio_path: dto.audio_path || '',
        difficulty_level: dto.difficulty_level,
        created_at: new Date().toISOString(),
      };
      
      setVocabularies(prev => [tempVocab, ...prev]);
      toast.info('Creating vocabulary...');
    },
    onSuccess: (data) => {
      // Replace temp vocab with real one
      setVocabularies(prev => 
        prev.map(v => v.vocab_id < 0 ? data : v)
      );
      toast.success('Vocabulary created successfully!');
    },
    onError: (error, dto, rollback) => {
      rollback();
      toast.error('Failed to create vocabulary');
    },
  });

  /**
   * Update vocabulary with optimistic update
   */
  const updateMutation = useOptimisticMutation({
    mutationFn: async ({ id, dto }: { id: number; dto: UpdateVocabularyDto }) => {
      const response = await vocabularyService.updateVocabulary(id, dto);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to update vocabulary');
      }
      return response.data;
    },
    onMutate: async ({ id, dto }) => {
      // Optimistically update in list
      setVocabularies(prev => 
        prev.map(v => 
          v.vocab_id === id 
            ? { ...v, ...dto } 
            : v
        )
      );
    },
    onSuccess: (data) => {
      // Replace with server response
      setVocabularies(prev => 
        prev.map(v => v.vocab_id === data.vocab_id ? data : v)
      );
      toast.success('Vocabulary updated!');
    },
    onError: (error, { id, dto }, rollback) => {
      rollback();
      toast.error('Failed to update vocabulary');
    },
  });

  /**
   * Delete vocabulary with optimistic update
   */
  const deleteMutation = useOptimisticMutation({
    mutationFn: async (id: number) => {
      const response = await vocabularyService.deleteVocabulary(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete vocabulary');
      }
      return id;
    },
    onMutate: async (id) => {
      // Optimistically remove from list
      setVocabularies(prev => prev.filter(v => v.vocab_id !== id));
      toast.info('Deleting vocabulary...');
    },
    onSuccess: () => {
      toast.success('Vocabulary deleted!');
    },
    onError: (error, id, rollback) => {
      rollback();
      toast.error('Failed to delete vocabulary');
    },
  });

  /**
   * Auto-fetch on mount if filters provided
   */
  useEffect(() => {
    if (initialFilters) {
      fetchVocabularies(initialFilters);
    }
  }, [initialFilters, fetchVocabularies]);

  return {
    vocabularies,
    listResponse,
    isLoading: isLoading || createMutation.isLoading || updateMutation.isLoading || deleteMutation.isLoading,
    error,
    fetchVocabularies,
    createVocabulary: createMutation.mutate,
    updateVocabulary: (id: number, dto: UpdateVocabularyDto) => updateMutation.mutate({ id, dto }),
    deleteVocabulary: deleteMutation.mutate,
  };
}

/**
 * Hook for vocabulary bookmarking with optimistic updates
 */
export function useVocabularyBookmark() {
  const [vocabularies, setVocabularies] = useState<VocabularyDto[]>([]);

  const { mutate: toggleBookmark, isLoading } = useOptimisticMutation({
    mutationFn: async ({ vocabId, isBookmarked }: { vocabId: number; isBookmarked: boolean }) => {
      const response = await fetch('/api/vocabulary-practice/bookmark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ vocab_id: vocabId, is_bookmarked: isBookmarked }),
      });

      if (!response.ok) throw new Error('Failed to bookmark');
      return response.json();
    },
    onMutate: ({ vocabId, isBookmarked }) => {
      // Optimistic update: toggle bookmark immediately
      setVocabularies(prev => 
        prev.map(vocab => 
          vocab.vocab_id === vocabId
            ? { ...vocab, is_bookmarked: isBookmarked } as any
            : vocab
        )
      );
    },
    onError: (error, { vocabId }, rollback) => {
      // Rollback on error
      rollback();
      toast.error('Failed to update bookmark');
    },
  });

  return {
    vocabularies,
    setVocabularies,
    toggleBookmark,
    isLoading,
  };
}