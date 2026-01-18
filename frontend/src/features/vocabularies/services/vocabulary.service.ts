import {
  VocabularyDto,
  CreateVocabularyDto,
  UpdateVocabularyDto,
  VocabularyFilterDto,
  VocabularyListResponseDto,
} from '../dtos/vocabulary.dto';
import { ServerResponseModel } from '@/lib/typedefs/server-response';
import { apiClient } from '@/lib/api/client';

export class VocabularyService {
  /**
   * Get all vocabularies with cache tags
   */
  async getAllVocabularies(): Promise<ServerResponseModel<VocabularyDto[]>> {
    return apiClient.get<VocabularyDto[]>('/vocabularies', {
      cache: true,
      cacheTTL: 5 * 60 * 1000,
      cacheTags: ['vocabularies', 'vocabularies-list'],
    });
  }

  /**
   * ✅ FIX: Sửa lại hàm này để tương thích với Backend hiện tại
   */
  async getVocabularies(filters?: VocabularyFilterDto): Promise<ServerResponseModel<VocabularyListResponseDto>> {
    const params = new URLSearchParams();
    
    // Map filters sang query params (Backend cần hỗ trợ lọc @Query thì cái này mới có tác dụng)
    // Hiện tại backend trả về ALL, frontend sẽ nhận hết và hiển thị.
    if (filters?.search) params.append('search', filters.search);
    if (filters?.difficulty && filters.difficulty !== 'all') params.append('difficulty', filters.difficulty);
    if (filters?.topic_id) params.append('topicId', filters.topic_id.toString());
    
    const queryString = params.toString();
    
    // 1. Đổi endpoint từ '/vocabularies/filter' thành '/vocabularies'
    const url = `/vocabularies${queryString ? `?${queryString}` : ''}`;

    const cacheTags = ['vocabularies', 'vocabularies-filter'];
    if (filters?.topic_id) cacheTags.push(`topic-${filters.topic_id}`);

    // Gọi API
    const response = await apiClient.get<any>(url, {
      cache: true,
      cacheTTL: 2 * 60 * 1000,
      cacheTags,
    });

    // 2. Xử lý logic tương thích ngược (Adapter)
    // Nếu Backend trả về mảng [] (cấu trúc cũ), ta tự gói nó vào format { data: [], total: ... }
    if (response.success && Array.isArray(response.data)) {
      const arrayData = response.data as VocabularyDto[];
      
      // (Optional) Thực hiện lọc client-side nếu backend chưa hỗ trợ lọc
      let filteredData = arrayData;
      if (filters?.difficulty && filters.difficulty !== 'all') {
        filteredData = arrayData.filter(v => v.difficulty_level === filters.difficulty);
      }
      // Note: Search text đã được handle ở useMemo bên UI, ở đây trả về raw cũng được

      return {
        ...response,
        data: {
          data: filteredData,
          total: filteredData.length,
          view_mode: filters?.view_mode || 'Grid',
          paginated: false,
          page: 1,
          limit: filteredData.length,
          total_pages: 1
        }
      };
    }

    // Nếu Backend đã trả về đúng format phân trang (tương lai) thì giữ nguyên
    return response as ServerResponseModel<VocabularyListResponseDto>;
  }

  async getVocabularyById(id: number): Promise<ServerResponseModel<VocabularyDto>> {
    return apiClient.get<VocabularyDto>(`/vocabularies/${id}`, {
      cache: true,
      cacheTTL: 10 * 60 * 1000,
      cacheTags: ['vocabularies', `vocabulary-${id}`],
    });
  }

  async getVocabulariesByTopic(topicId: number): Promise<VocabularyDto[]> {
    const response = await apiClient.get<VocabularyDto[]>(`/vocabularies/topic/${topicId}`, {
      cache: true,
      cacheTTL: 5 * 60 * 1000,
      cacheTags: ['vocabularies', `topic-${topicId}`],
    });
    return response.data || [];
  }

  async searchVocabularies(query: string): Promise<VocabularyDto[]> {
    const response = await apiClient.get<VocabularyDto[]>(
      `/vocabularies/search?q=${encodeURIComponent(query)}`,
      {
        cache: true,
        cacheTTL: 1 * 60 * 1000,
        cacheTags: ['vocabularies', 'vocabularies-search'],
      }
    );
    return response.data || [];
  }

  async createVocabulary(dto: CreateVocabularyDto): Promise<ServerResponseModel<VocabularyDto>> {
    const response = await apiClient.post<VocabularyDto>('/vocabularies', dto, { retries: 2 });
    if (response.success) {
      apiClient.invalidateCache({ tags: ['vocabularies', 'topics'] });
      if (dto.topic_id) apiClient.invalidateCache({ tags: [`topic-${dto.topic_id}`] });
    }
    return response;
  }

  async updateVocabulary(id: number, dto: UpdateVocabularyDto): Promise<ServerResponseModel<VocabularyDto>> {
    const response = await apiClient.put<VocabularyDto>(`/vocabularies/${id}`, dto, { retries: 2 });
    if (response.success) {
      apiClient.invalidateCache({ tags: ['vocabularies', 'topics', `vocabulary-${id}`] });
      if (dto.topic_id) apiClient.invalidateCache({ tags: [`topic-${dto.topic_id}`] });
    }
    return response;
  }

  async deleteVocabulary(id: number): Promise<ServerResponseModel<void>> {
    const response = await apiClient.delete<void>(`/vocabularies/${id}`, { retries: 1 });
    if (response.success) {
      apiClient.invalidateCache({ tags: ['vocabularies', 'topics', `vocabulary-${id}`] });
    }
    return response;
  }

  invalidateVocabulary(id: number) { apiClient.invalidateCache({ tags: [`vocabulary-${id}`] }); }
  invalidateTopicVocabularies(topicId: number) { apiClient.invalidateCache({ tags: [`topic-${topicId}`] }); }
  invalidateAllVocabularies() { apiClient.invalidateCache({ tags: ['vocabularies'] }); }
}

export const vocabularyService = new VocabularyService();