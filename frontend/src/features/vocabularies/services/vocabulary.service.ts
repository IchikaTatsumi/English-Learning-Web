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
   * ✅ IMPROVED: Get all vocabularies with cache tags
   * GET /vocabularies
   * Cached for 5 minutes with tags: ['vocabularies', 'vocabularies-list']
   */
  async getAllVocabularies(): Promise<ServerResponseModel<VocabularyDto[]>> {
    return apiClient.get<VocabularyDto[]>('/vocabularies', {
      cache: true,
      cacheTTL: 5 * 60 * 1000, // 5 minutes
      cacheTags: ['vocabularies', 'vocabularies-list'], // ✅ Cache tags
    });
  }

  /**
   * ✅ IMPROVED: Get vocabularies with flexible filtering + cache tags
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

    // ✅ Add cache tags based on filters
    const cacheTags = ['vocabularies', 'vocabularies-filter'];
    
    if (filters?.topic_id) {
      cacheTags.push(`topic-${filters.topic_id}`);
    }
    
    if (filters?.difficulty) {
      cacheTags.push(`difficulty-${filters.difficulty}`);
    }

    return apiClient.get<VocabularyListResponseDto>(url, {
      cache: true,
      cacheTTL: 2 * 60 * 1000, // 2 minutes
      cacheTags, // ✅ Dynamic cache tags
    });
  }

  /**
   * ✅ IMPROVED: Get vocabulary by ID with cache tags
   * GET /vocabularies/:id
   * Cached for 10 minutes (vocabulary data rarely changes)
   */
  async getVocabularyById(id: number): Promise<ServerResponseModel<VocabularyDto>> {
    return apiClient.get<VocabularyDto>(`/vocabularies/${id}`, {
      cache: true,
      cacheTTL: 10 * 60 * 1000, // 10 minutes
      cacheTags: ['vocabularies', `vocabulary-${id}`], // ✅ Specific vocab tag
    });
  }

  /**
   * ✅ IMPROVED: Get vocabularies by topic with cache tags
   * GET /vocabularies/topic/:topicId
   * Cached for 5 minutes
   */
  async getVocabulariesByTopic(topicId: number): Promise<VocabularyDto[]> {
    const response = await apiClient.get<VocabularyDto[]>(`/vocabularies/topic/${topicId}`, {
      cache: true,
      cacheTTL: 5 * 60 * 1000,
      cacheTags: ['vocabularies', `topic-${topicId}`], // ✅ Topic-specific tag
    });
    return response.data || [];
  }

  /**
   * ✅ IMPROVED: Search vocabularies with cache tags
   * GET /vocabularies/search?q=hello
   * Cached for 1 minute (search results change frequently)
   */
  async searchVocabularies(query: string): Promise<VocabularyDto[]> {
    const response = await apiClient.get<VocabularyDto[]>(
      `/vocabularies/search?q=${encodeURIComponent(query)}`,
      {
        cache: true,
        cacheTTL: 1 * 60 * 1000, // 1 minute
        cacheTags: ['vocabularies', 'vocabularies-search'], // ✅ Search tag
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
   * ✅ IMPROVED: Get default vocabularies with cache tags
   * GET /vocabularies/default
   * Cached for 5 minutes
   */
  async getDefaultVocabularies(): Promise<VocabularyDto[]> {
    const response = await apiClient.get<VocabularyDto[]>('/vocabularies/default', {
      cache: true,
      cacheTTL: 5 * 60 * 1000,
      cacheTags: ['vocabularies', 'vocabularies-default'], // ✅ Default tag
    });
    return response.data || [];
  }

  /**
   * Create vocabulary (Admin only)
   * POST /vocabularies
   * Auto-invalidates: ['vocabularies', 'topics'] tags
   */
  async createVocabulary(dto: CreateVocabularyDto): Promise<ServerResponseModel<VocabularyDto>> {
    const response = await apiClient.post<VocabularyDto>('/vocabularies', dto, {
      retries: 2, // Retry twice on network error
    });

    // ✅ Manually invalidate related caches by tags
    if (response.success) {
      apiClient.invalidateCache({ tags: ['vocabularies', 'topics'] });
      
      // Invalidate topic-specific cache
      if (dto.topic_id) {
        apiClient.invalidateCache({ tags: [`topic-${dto.topic_id}`] });
      }
    }

    return response;
  }

  /**
   * Update vocabulary (Admin only)
   * PUT /vocabularies/:id
   * Auto-invalidates: ['vocabularies', 'topics', 'vocabulary-{id}'] tags
   */
  async updateVocabulary(id: number, dto: UpdateVocabularyDto): Promise<ServerResponseModel<VocabularyDto>> {
    const response = await apiClient.put<VocabularyDto>(`/vocabularies/${id}`, dto, {
      retries: 2,
    });

    // ✅ Invalidate specific vocab and related caches
    if (response.success) {
      apiClient.invalidateCache({ 
        tags: ['vocabularies', 'topics', `vocabulary-${id}`] 
      });

      // Invalidate old and new topic caches
      if (dto.topic_id) {
        apiClient.invalidateCache({ tags: [`topic-${dto.topic_id}`] });
      }
    }

    return response;
  }

  /**
   * Delete vocabulary (Admin only)
   * DELETE /vocabularies/:id
   * Auto-invalidates: ['vocabularies', 'topics', 'vocabulary-{id}'] tags
   */
  async deleteVocabulary(id: number): Promise<ServerResponseModel<void>> {
    const response = await apiClient.delete<void>(`/vocabularies/${id}`, {
      retries: 1, // Only retry once for deletes
    });

    // ✅ Invalidate all related caches
    if (response.success) {
      apiClient.invalidateCache({ 
        tags: ['vocabularies', 'topics', `vocabulary-${id}`] 
      });
    }

    return response;
  }

  /**
   * ✅ NEW: Manually invalidate specific vocabulary cache
   */
  invalidateVocabulary(id: number) {
    apiClient.invalidateCache({ tags: [`vocabulary-${id}`] });
  }

  /**
   * ✅ NEW: Manually invalidate topic vocabularies
   */
  invalidateTopicVocabularies(topicId: number) {
    apiClient.invalidateCache({ tags: [`topic-${topicId}`] });
  }

  /**
   * ✅ NEW: Manually invalidate all vocabulary caches
   */
  invalidateAllVocabularies() {
    apiClient.invalidateCache({ tags: ['vocabularies'] });
  }

  /**
   * ✅ DEPRECATED: Use tag-based invalidation instead
   */
  invalidateCaches() {
    console.warn('invalidateCaches() is deprecated. Use invalidateAllVocabularies() instead.');
    this.invalidateAllVocabularies();
  }
}

export const vocabularyService = new VocabularyService();