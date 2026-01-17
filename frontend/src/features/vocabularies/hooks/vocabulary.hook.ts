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

  // ✅ SỬA LỖI TREO: Chuyển object filters thành string để so sánh giá trị thay vì tham chiếu
  const filterString = JSON.stringify(initialFilters);

  useEffect(() => {
    if (initialFilters) {
      fetchVocabularies(initialFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterString, fetchVocabularies]); 

  // ... (giữ nguyên các phần mutation create/update/delete bên dưới)
  return {
    vocabularies,
    listResponse,
    isLoading, // Có thể kết hợp với mutation loading như code cũ của bạn
    error,
    fetchVocabularies,
    // ... trả về các mutation methods
  };
}