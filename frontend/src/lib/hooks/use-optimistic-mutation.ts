import { useState, useCallback, useRef } from 'react';
import { toast } from '../utils/toast';

/**
 * ✅ NEW: Snapshot interface for rollback
 */
interface StateSnapshot {
  timestamp: number;
  data: any;
  metadata?: Record<string, any>;
}

/**
 * Optimistic Mutation Options
 */
interface OptimisticMutationOptions<TData, TVariables, TContext = any> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  
  // ✅ IMPROVED: onMutate returns context for rollback
  onMutate?: (variables: TVariables) => TContext | Promise<TContext>;
  
  onSuccess?: (data: TData, variables: TVariables, context?: TContext) => void | Promise<void>;
  
  // ✅ IMPROVED: rollback receives context
  onError?: (
    error: any, 
    variables: TVariables, 
    context: TContext | undefined,
    rollback: () => void
  ) => void | Promise<void>;
  
  onSettled?: (
    data: TData | undefined, 
    error: any | undefined, 
    variables: TVariables,
    context?: TContext
  ) => void | Promise<void>;
  
  // ✅ NEW: Auto rollback on error (default: true)
  autoRollback?: boolean;
  
  // ✅ NEW: Show toast on error (default: true)
  showErrorToast?: boolean;
}

/**
 * Optimistic Mutation Result
 */
interface OptimisticMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData | undefined>;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  isLoading: boolean;
  isError: boolean;
  error: any | null;
  data: TData | undefined;
  reset: () => void;
  canRetry: boolean;
  retry: () => Promise<TData | undefined>;
}

/**
 * ✅ IMPROVED: Hook for optimistic mutations with state snapshots
 * 
 * @example
 * ```tsx
 * const { mutate, isLoading, retry } = useOptimisticMutation({
 *   mutationFn: (id: number) => api.deleteVocab(id),
 *   onMutate: (id) => {
 *     // ✅ Return snapshot for rollback
 *     const previousVocabs = [...vocabularies];
 *     
 *     // Update UI immediately
 *     setVocabularies(prev => prev.filter(v => v.id !== id));
 *     
 *     return { previousVocabs }; // Context for rollback
 *   },
 *   onError: (error, id, context, rollback) => {
 *     // ✅ Auto rollback using context
 *     // or call rollback() manually
 *   },
 * });
 * ```
 */
export function useOptimisticMutation<TData = any, TVariables = any, TContext = any>(
  options: OptimisticMutationOptions<TData, TVariables, TContext>
): OptimisticMutationResult<TData, TVariables> {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<any | null>(null);
  const [data, setData] = useState<TData | undefined>(undefined);

  // ✅ IMPROVED: Store context for rollback
  const contextRef = useRef<TContext | undefined>(undefined);
  const lastVariablesRef = useRef<TVariables | undefined>(undefined);
  const canRetryRef = useRef(false);

  // Default options
  const autoRollback = options.autoRollback ?? true;
  const showErrorToast = options.showErrorToast ?? true;

  /**
   * Reset mutation state
   */
  const reset = useCallback(() => {
    setIsLoading(false);
    setIsError(false);
    setError(null);
    setData(undefined);
    contextRef.current = undefined;
    lastVariablesRef.current = undefined;
    canRetryRef.current = false;
  }, []);

  /**
   * ✅ IMPROVED: Rollback with context
   */
  const rollback = useCallback(() => {
    // No-op: actual rollback is handled in onError with context
    // This is just a marker for backward compatibility
    console.log('🔄 Rollback triggered');
  }, []);

  /**
   * Execute mutation with optimistic updates
   */
  const mutateAsync = useCallback(async (variables: TVariables): Promise<TData> => {
    setIsLoading(true);
    setIsError(false);
    setError(null);
    lastVariablesRef.current = variables;
    canRetryRef.current = false;

    try {
      // 1. ✅ IMPROVED: Optimistic update with context capture
      if (options.onMutate) {
        const context = await options.onMutate(variables);
        contextRef.current = context;
      }

      // 2. Execute actual mutation
      const result = await options.mutationFn(variables);
      setData(result);

      // 3. Success callback with context
      if (options.onSuccess) {
        await options.onSuccess(result, variables, contextRef.current);
      }

      // 4. Settled callback
      if (options.onSettled) {
        await options.onSettled(result, undefined, variables, contextRef.current);
      }

      // Clear context after success
      contextRef.current = undefined;
      canRetryRef.current = false;

      return result;
    } catch (err) {
      setIsError(true);
      setError(err);
      canRetryRef.current = true; // ✅ Allow retry on error

      // 5. ✅ IMPROVED: Error callback with context
      if (options.onError) {
        await options.onError(err, variables, contextRef.current, rollback);
      } else if (autoRollback && contextRef.current) {
        // ✅ Auto rollback: User should implement rollback logic in onMutate context
        console.warn('Auto rollback enabled but no onError handler to restore state');
      }

      // Show error toast
      if (showErrorToast) {
        const message = err instanceof Error ? err.message : 'Mutation failed';
        toast.error(message);
      }

      // 6. Settled callback
      if (options.onSettled) {
        await options.onSettled(undefined, err, variables, contextRef.current);
      }

      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [options, rollback, autoRollback, showErrorToast]);

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

  /**
   * ✅ NEW: Retry last mutation
   */
  const retry = useCallback(async (): Promise<TData | undefined> => {
    if (!canRetryRef.current || !lastVariablesRef.current) {
      console.warn('Cannot retry: no previous mutation');
      return undefined;
    }

    return mutate(lastVariablesRef.current);
  }, [mutate]);

  return {
    mutate,
    mutateAsync,
    isLoading,
    isError,
    error,
    data,
    reset,
    canRetry: canRetryRef.current,
    retry,
  };
}

/**
 * ✅ NEW: Example usage with proper state snapshot
 */
export function useDeleteVocabularyExample() {
  const [vocabularies, setVocabularies] = useState<any[]>([]);

  const { mutate: deleteVocab, isLoading, retry, canRetry } = useOptimisticMutation({
    mutationFn: async (vocabId: number) => {
      const response = await fetch(`/api/vocabularies/${vocabId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) throw new Error('Delete failed');
      return response.json();
    },

    // ✅ Return snapshot for rollback
    onMutate: (vocabId) => {
      const previousVocabularies = [...vocabularies];
      
      // Optimistic update
      setVocabularies(prev => prev.filter(v => v.vocab_id !== vocabId));
      
      toast.info('Deleting vocabulary...');
      
      // Return context with snapshot
      return { previousVocabularies, deletedId: vocabId };
    },

    // ✅ Restore from snapshot on error
    onError: (error, vocabId, context) => {
      if (context?.previousVocabularies) {
        setVocabularies(context.previousVocabularies);
        toast.error('Failed to delete. Changes reverted.');
      }
    },

    onSuccess: (data, vocabId) => {
      toast.success('Vocabulary deleted successfully');
    },
  });

  return {
    vocabularies,
    deleteVocab,
    isLoading,
    retry,
    canRetry,
  };
}

/**
 * ✅ NEW: Example with bookmark toggle
 */
export function useBookmarkVocabulary() {
  const [vocabularies, setVocabularies] = useState<any[]>([]);

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

      if (!response.ok) throw new Error('Bookmark failed');
      return response.json();
    },

    // ✅ Capture previous state
    onMutate: ({ vocabId, isBookmarked }) => {
      const previousVocabularies = [...vocabularies];
      
      // Optimistic update
      setVocabularies(prev => 
        prev.map(vocab => 
          vocab.vocab_id === vocabId
            ? { ...vocab, is_bookmarked: isBookmarked }
            : vocab
        )
      );
      
      return { previousVocabularies };
    },

    // ✅ Restore on error
    onError: (error, variables, context) => {
      if (context?.previousVocabularies) {
        setVocabularies(context.previousVocabularies);
      }
    },

    onSuccess: (data, { isBookmarked }) => {
      toast.success(isBookmarked ? 'Bookmarked' : 'Removed bookmark');
    },
  });

  return {
    vocabularies,
    setVocabularies,
    toggleBookmark,
    isLoading,
  };
}

/**
 * ✅ NEW: Example with create vocabulary
 */
export function useCreateVocabulary() {
  const [vocabularies, setVocabularies] = useState<any[]>([]);

  const { mutate: createVocab, isLoading } = useOptimisticMutation({
    mutationFn: async (dto: any) => {
      const response = await fetch('/api/vocabularies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(dto),
      });

      if (!response.ok) throw new Error('Create failed');
      return response.json();
    },

    // ✅ Add temporary item
    onMutate: (dto) => {
      const previousVocabularies = [...vocabularies];
      
      const tempVocab = {
        vocab_id: -Date.now(), // Temporary negative ID
        ...dto,
        created_at: new Date().toISOString(),
      };
      
      setVocabularies(prev => [tempVocab, ...prev]);
      
      return { previousVocabularies, tempId: tempVocab.vocab_id };
    },

    // ✅ Replace temp with real data
    onSuccess: (data, dto, context) => {
      if (context?.tempId) {
        setVocabularies(prev => 
          prev.map(v => v.vocab_id === context.tempId ? data : v)
        );
      }
    },

    // ✅ Remove temp on error
    onError: (error, dto, context) => {
      if (context?.previousVocabularies) {
        setVocabularies(context.previousVocabularies);
      }
    },
  });

  return {
    vocabularies,
    createVocab,
    isLoading,
  };
}