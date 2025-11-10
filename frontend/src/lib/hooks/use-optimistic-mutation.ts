import { useState, useCallback, useRef } from 'react';
import { toast } from '../utils/toast';

/**
 * Optimistic Mutation Options
 */
interface OptimisticMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onMutate?: (variables: TVariables) => void | Promise<void>;
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>;
  onError?: (error: any, variables: TVariables, rollback: () => void) => void | Promise<void>;
  onSettled?: (data: TData | undefined, error: any | undefined, variables: TVariables) => void | Promise<void>;
}

/**
 * Optimistic Mutation Result
 */
interface OptimisticMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData | undefined>;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  isLoading: boolean;
  error: any | null;
  data: TData | undefined;
  reset: () => void;
}

/**
 * Hook for optimistic mutations
 * 
 * @example
 * ```tsx
 * const { mutate, isLoading } = useOptimisticMutation({
 *   mutationFn: (id: number) => api.post('/bookmark', { vocab_id: id }),
 *   onMutate: (id) => {
 *     // Update UI immediately
 *     setVocabs(prev => prev.map(v => 
 *       v.id === id ? { ...v, isBookmarked: !v.isBookmarked } : v
 *     ));
 *   },
 *   onError: (error, id, rollback) => {
 *     rollback(); // Revert UI changes
 *     toast.error('Failed to bookmark');
 *   },
 * });
 * ```
 */
export function useOptimisticMutation<TData = any, TVariables = any>(
  options: OptimisticMutationOptions<TData, TVariables>
): OptimisticMutationResult<TData, TVariables> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any | null>(null);
  const [data, setData] = useState<TData | undefined>(undefined);

  // Store rollback state
  const rollbackStateRef = useRef<any>(null);

  /**
   * Reset mutation state
   */
  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setData(undefined);
    rollbackStateRef.current = null;
  }, []);

  /**
   * Rollback function
   */
  const rollback = useCallback(() => {
    if (options.onMutate && rollbackStateRef.current) {
      // Call onMutate with original variables to revert
      options.onMutate(rollbackStateRef.current);
    }
  }, [options]);

  /**
   * Execute mutation with optimistic updates
   */
  const mutateAsync = useCallback(async (variables: TVariables): Promise<TData> => {
    setIsLoading(true);
    setError(null);
    rollbackStateRef.current = variables;

    try {
      // 1. Optimistic update (onMutate)
      if (options.onMutate) {
        await options.onMutate(variables);
      }

      // 2. Execute actual mutation
      const result = await options.mutationFn(variables);
      setData(result);

      // 3. Success callback
      if (options.onSuccess) {
        await options.onSuccess(result, variables);
      }

      // 4. Settled callback
      if (options.onSettled) {
        await options.onSettled(result, undefined, variables);
      }

      return result;
    } catch (err) {
      setError(err);

      // 5. Error callback with rollback
      if (options.onError) {
        await options.onError(err, variables, rollback);
      } else {
        // Default error handling
        rollback();
        toast.error(err instanceof Error ? err.message : 'Mutation failed');
      }

      // 6. Settled callback
      if (options.onSettled) {
        await options.onSettled(undefined, err, variables);
      }

      throw err;
    } finally {
      setIsLoading(false);
      rollbackStateRef.current = null;
    }
  }, [options, rollback]);

  /**
   * Execute mutation without throwing error
   */
  const mutate = useCallback(async (variables: TVariables): Promise<TData | undefined> => {
    try {
      return await mutateAsync(variables);
    } catch (error) {
      return undefined;
    }
  }, [mutateAsync]);

  return {
    mutate,
    mutateAsync,
    isLoading,
    error,
    data,
    reset,
  };
}

/**
 * Example usage in vocabulary component
 */
export function useBookmarkVocabulary() {
  const [vocabularies, setVocabularies] = useState<any[]>([]);

  const { mutate: toggleBookmark, isLoading } = useOptimisticMutation({
    mutationFn: async (vocabId: number) => {
      const response = await fetch('/api/vocabulary-practice/bookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vocab_id: vocabId, is_bookmarked: true }),
      });
      return response.json();
    },
    onMutate: (vocabId) => {
      // Optimistic update: toggle bookmark immediately
      setVocabularies(prev => 
        prev.map(vocab => 
          vocab.vocab_id === vocabId
            ? { ...vocab, is_bookmarked: !vocab.is_bookmarked }
            : vocab
        )
      );
    },
    onError: (error, vocabId, rollback) => {
      // Rollback on error
      rollback();
      toast.error('Failed to bookmark vocabulary');
    },
    onSuccess: (data, vocabId) => {
      toast.success('Bookmark updated');
    },
  });

  return {
    vocabularies,
    toggleBookmark,
    isLoading,
  };
}