import { useState, useCallback, useEffect } from 'react';
import { vocabularyService } from '../services/vocabulary.service';
import { 
  VocabularyDto, 
  VocabularyFilterDto, 
  CreateVocabularyDto, 
  UpdateVocabularyDto,
  VocabularyListResponseDto
} from '../dtos/vocabulary.dto';
import { toast } from '@/lib/utils/toast';

export function useVocabularies(initialFilters?: VocabularyFilterDto) {
  const [vocabularies, setVocabularies] = useState<VocabularyDto[]>([]);
  const [listResponse, setListResponse] = useState<VocabularyListResponseDto | null>(null);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch Vocabularies
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
      setVocabularies([]); // Reset list on error or keep old data depending on UX
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fix lỗi loop useEffect bằng cách stringify filters
  const filterString = JSON.stringify(initialFilters);

  useEffect(() => {
    if (initialFilters) {
      fetchVocabularies(initialFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterString, fetchVocabularies]);

  // 2. Create Vocabulary
  const createVocabulary = async (dto: CreateVocabularyDto) => {
    setIsCreating(true);
    try {
      const response = await vocabularyService.createVocabulary(dto);
      if (response.success && response.data) {
        // Cập nhật UI ngay lập tức (thêm vào đầu danh sách)
        setVocabularies((prev) => [response.data!, ...prev]);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create vocabulary');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create vocabulary';
      toast.error(message);
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  // 3. Update Vocabulary
  const updateVocabulary = async (id: number, dto: UpdateVocabularyDto) => {
    setIsUpdating(true);
    try {
      const response = await vocabularyService.updateVocabulary(id, dto);
      if (response.success && response.data) {
        // Cập nhật item trong danh sách
        setVocabularies((prev) => 
          prev.map((v) => (v.vocab_id === id ? response.data! : v))
        );
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update vocabulary');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update vocabulary';
      toast.error(message);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  // 4. Delete Vocabulary
  const deleteVocabulary = async (id: number) => {
    setIsDeleting(true);
    try {
      const response = await vocabularyService.deleteVocabulary(id);
      if (response.success) {
        // Xóa khỏi danh sách local
        setVocabularies((prev) => prev.filter((v) => v.vocab_id !== id));
      } else {
        throw new Error(response.message || 'Failed to delete vocabulary');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete vocabulary';
      toast.error(message);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  };

  // ✅ RETURN ĐẦY ĐỦ CÁC HÀM VÀ STATE MÀ COMPONENT CẦN
  return {
    vocabularies,
    listResponse,
    isLoading,
    isCreating, // Đã thêm
    isUpdating, // Đã thêm
    isDeleting, // Đã thêm
    error,
    fetchVocabularies,
    createVocabulary, // Đã thêm
    updateVocabulary, // Đã thêm
    deleteVocabulary, // Đã thêm
  };
}