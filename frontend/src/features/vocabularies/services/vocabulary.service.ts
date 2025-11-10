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
   * Get all vocabularies
   * GET /vocabularies
   * Cached for 5 minutes
   */
  async getAllVocabularies(): Promise<ServerResponseModel<VocabularyDto[]>> {
    return apiClient.get<VocabularyDto[]>('/vocabularies', {
      cache: true,
      cacheTTL: 5 * 60 * 1000, // 5 minutes
    });
  }

  /**
   * Get vocabularies with flexible filtering
   * GET /vocabularies/filter
   * Cached for 2 minutes (shorter TTL due to filters)
   */
  async getVocabularies(filters?: VocabularyFilterDto): Promise<ServerResponseModel<VocabularyListResponseDto>> {
    const params = new URLSearchParams();
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);
    if (filters?.topic_id) params.append('topicId', filters.topic_id.toString());
    if (filters?.only_learned !== undefined) params.append('onlyLearned', filters.only_learned.toString());
    if (filters?.recently_learned !== undefined) params.append('recentlyLearned', filters.recently_learned.toString());
    if (filters?.view_mode) params.append('viewMode', filters.view_mode);
    if (filters?.paginate !== undefined) params.append('paginate', filters.paginate.toString());
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sort_by) params.append('sortBy', filters.sort_by);
    if (filters?.sort_order) params.append('sortOrder', filters.sort_order);

    const queryString = params.toString();
    const url = `/vocabularies/filter${queryString ? `?${queryString}` : ''}`;

    return apiClient.get<VocabularyListResponseDto>(url, {
      cache: true,
      cacheTTL: 2 * 60 * 1000, // 2 minutes (shorter due to dynamic filters)
    });
  }

  /**
   * Get vocabulary by ID
   * GET /vocabularies/:id
   * Cached for 10 minutes (vocabulary data rarely changes)
   */
  async getVocabularyById(id: number): Promise<ServerResponseModel<VocabularyDto>> {
    return apiClient.get<VocabularyDto>(`/vocabularies/${id}`, {
      cache: true,
      cacheTTL: 10 * 60 * 1000, // 10 minutes
    });
  }

  /**
   * Get vocabularies by topic
   * GET /vocabularies/topic/:topicId
   * Cached for 5 minutes
   */
  async getVocabulariesByTopic(topicId: number): Promise<VocabularyDto[]> {
    const response = await apiClient.get<VocabularyDto[]>(`/vocabularies/topic/${topicId}`, {
      cache: true,
      cacheTTL: 5 * 60 * 1000,
    });
    return response.data || [];
  }

  /**
   * Search vocabularies
   * GET /vocabularies/search?q=hello
   * Cached for 1 minute (search results change frequently)
   */
  async searchVocabularies(query: string): Promise<VocabularyDto[]> {
    const response = await apiClient.get<VocabularyDto[]>(
      `/vocabularies/search?q=${encodeURIComponent(query)}`,
      {
        cache: true,
        cacheTTL: 1 * 60 * 1000, // 1 minute
      }
    );
    return response.data || [];
  }

  /**
   * Get random vocabularies
   * GET /vocabularies/random
   * Not cached (random should be fresh)
   */
  async getRandomVocabularies(count: number = 10, difficulty?: string): Promise<VocabularyDto[]> {
    const params = new URLSearchParams();
    params.append('count', count.toString());
    if (difficulty) params.append('difficulty', difficulty);

    const response = await apiClient.get<VocabularyDto[]>(
      `/vocabularies/random?${params.toString()}`,
      {
        cache: false, // Don't cache random results
      }
    );
    return response.data || [];
  }

  /**
   * Get default vocabularies (reset filter)
   * GET /vocabularies/default
   * Cached for 5 minutes
   */
  async getDefaultVocabularies(): Promise<VocabularyDto[]> {
    const response = await apiClient.get<VocabularyDto[]>('/vocabularies/default', {
      cache: true,
      cacheTTL: 5 * 60 * 1000,
    });
    return response.data || [];
  }

  /**
   * Create vocabulary (Admin only)
   * POST /vocabularies
   * Auto-invalidates related caches
   */
  async createVocabulary(dto: CreateVocabularyDto): Promise<ServerResponseModel<VocabularyDto>> {
    const response = await apiClient.post<VocabularyDto>('/vocabularies', dto, {
      retries: 2, // Retry twice on network error
    });

    // Caches will be auto-invalidated by apiClient
    return response;
  }

  /**
   * Update vocabulary (Admin only)
   * PUT /vocabularies/:id
   * Auto-invalidates related caches
   */
  async updateVocabulary(id: number, dto: UpdateVocabularyDto): Promise<ServerResponseModel<VocabularyDto>> {
    return apiClient.put<VocabularyDto>(`/vocabularies/${id}`, dto, {
      retries: 2,
    });
  }

  /**
   * Delete vocabulary (Admin only)
   * DELETE /vocabularies/:id
   * Auto-invalidates related caches
   */
  async deleteVocabulary(id: number): Promise<ServerResponseModel<void>> {
    return apiClient.delete<void>(`/vocabularies/${id}`, {
      retries: 1, // Only retry once for deletes
    });
  }

  /**
   * Manually invalidate vocabulary caches
   * Useful when you know data changed externally
   */
  invalidateCaches() {
    apiClient.invalidateCache(/GET:.*\/vocabularies.*/);
  }
}

export const vocabularyService = new VocabularyService();