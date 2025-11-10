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
   * ✅ IMPROVED: Create vocabulary with optimistic update + retry
   */
  const createMutation = useOptimisticMutation({
    mutationFn: async (dto: CreateVocabularyDto) => {
      const response = await vocabularyService.createVocabulary(dto);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to create vocabulary');
      }
      return response.data;
    },
    
    // ✅ Return snapshot for rollback
    onMutate: (dto) => {
      const previousVocabularies = [...vocabularies];
      
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
      
      return { previousVocabularies, tempId: tempVocab.vocab_id };
    },
    
    onSuccess: (data, dto, context) => {
      // Replace temp vocab with real one
      if (context?.tempId) {
        setVocabularies(prev => 
          prev.map(v => v.vocab_id === context.tempId ? data : v)
        );
      }
      toast.success('Vocabulary created successfully!');
    },
    
    // ✅ Restore from snapshot on error
    onError: (error, dto, context) => {
      if (context?.previousVocabularies) {
        setVocabularies(context.previousVocabularies);
      }
      // Error toast shown by default
    },
  });

  /**
   * ✅ IMPROVED: Update vocabulary with optimistic update + retry
   */
  const updateMutation = useOptimisticMutation({
    mutationFn: async ({ id, dto }: { id: number; dto: UpdateVocabularyDto }) => {
      const response = await vocabularyService.updateVocabulary(id, dto);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to update vocabulary');
      }
      return response.data;
    },
    
    // ✅ Return snapshot
    onMutate: ({ id, dto }) => {
      const previousVocabularies = [...vocabularies];
      
      // Optimistically update in list
      setVocabularies(prev => 
        prev.map(v => 
          v.vocab_id === id 
            ? { ...v, ...dto } 
            : v
        )
      );
      
      return { previousVocabularies };
    },
    
    onSuccess: (data) => {
      // Replace with server response
      setVocabularies(prev => 
        prev.map(v => v.vocab_id === data.vocab_id ? data : v)
      );
      toast.success('Vocabulary updated!');
    },
    
    // ✅ Restore on error
    onError: (error, { id, dto }, context) => {
      if (context?.previousVocabularies) {
        setVocabularies(context.previousVocabularies);
      }
    },
  });

  /**
   * ✅ IMPROVED: Delete vocabulary with optimistic update + retry
   */
  const deleteMutation = useOptimisticMutation({
    mutationFn: async (id: number) => {
      const response = await vocabularyService.deleteVocabulary(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete vocabulary');
      }
      return id;
    },
    
    // ✅ Return snapshot
    onMutate: (id) => {
      const previousVocabularies = [...vocabularies];
      
      // Optimistically remove from list
      setVocabularies(prev => prev.filter(v => v.vocab_id !== id));
      toast.info('Deleting vocabulary...');
      
      return { previousVocabularies };
    },
    
    onSuccess: () => {
      toast.success('Vocabulary deleted!');
    },
    
    // ✅ Restore on error
    onError: (error, id, context) => {
      if (context?.previousVocabularies) {
        setVocabularies(context.previousVocabularies);
      }
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
    
    // Fetch
    fetchVocabularies,
    
    // Create
    createVocabulary: createMutation.mutate,
    isCreating: createMutation.isLoading,
    createError: createMutation.error,
    retryCreate: createMutation.retry,
    canRetryCreate: createMutation.canRetry,
    
    // Update
    updateVocabulary: (id: number, dto: UpdateVocabularyDto) => updateMutation.mutate({ id, dto }),
    isUpdating: updateMutation.isLoading,
    updateError: updateMutation.error,
    retryUpdate: updateMutation.retry,
    canRetryUpdate: updateMutation.canRetry,
    
    // Delete
    deleteVocabulary: deleteMutation.mutate,
    isDeleting: deleteMutation.isLoading,
    deleteError: deleteMutation.error,
    retryDelete: deleteMutation.retry,
    canRetryDelete: deleteMutation.canRetry,
  };
}

/**
 * ✅ IMPROVED: Hook for vocabulary bookmarking with optimistic updates + retry
 */
export function useVocabularyBookmark() {
  const [vocabularies, setVocabularies] = useState<VocabularyDto[]>([]);

  const { mutate: toggleBookmark, isLoading, retry, canRetry } = useOptimisticMutation({
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
    
    // ✅ Return snapshot
    onMutate: ({ vocabId, isBookmarked }) => {
      const previousVocabularies = [...vocabularies];
      
      // Optimistic update: toggle bookmark immediately
      setVocabularies(prev => 
        prev.map(vocab => 
          vocab.vocab_id === vocabId
            ? { ...vocab, is_bookmarked: isBookmarked } as any
            : vocab
        )
      );
      
      return { previousVocabularies };
    },
    
    // ✅ Restore on error
    onError: (error, { vocabId }, context) => {
      if (context?.previousVocabularies) {
        setVocabularies(context.previousVocabularies);
      }
    },
  });

  return {
    vocabularies,
    setVocabularies,
    toggleBookmark,
    isLoading,
    retry, 
    canRetry, 
  };
}

 