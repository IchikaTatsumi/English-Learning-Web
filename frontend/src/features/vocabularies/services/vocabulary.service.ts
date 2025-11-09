import {
  VocabularyDto,
  CreateVocabularyDto,
  UpdateVocabularyDto,
  VocabularyFilterDto,
  VocabularyListResponseDto,
  VocabularyWithProgressDto,
} from '../dtos/vocabulary.dto';
import { ServerResponseModel } from '@/lib/typedefs/server-response';

export class VocabularyService {
  private baseUrl = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:4000/api';

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  /**
   * Get all vocabularies
   * GET /vocabularies
   */
  async getAllVocabularies(): Promise<ServerResponseModel<VocabularyDto[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/vocabularies`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch vocabularies');

      const data = await response.json();
      return {
        success: true,
        statusCode: 200,
        data
      };
    } catch (error) {
      console.error('Error fetching vocabularies:', error);
      return {
        success: false,
        statusCode: 500,
        message: error instanceof Error ? error.message : 'Failed to fetch vocabularies'
      };
    }
  }

  /**
   * Get vocabularies with flexible filtering
   * GET /vocabularies/filter?difficulty=Beginner&topic_id=1&only_learned=true
   */
  async getVocabularies(filters?: VocabularyFilterDto): Promise<ServerResponseModel<VocabularyListResponseDto>> {
    try {
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

      const response = await fetch(`${this.baseUrl}/vocabularies/filter?${params.toString()}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch vocabularies');
      
      const data = await response.json();
      return {
        success: true,
        statusCode: 200,
        data
      };
    } catch (error) {
      console.error('Error fetching vocabularies:', error);
      return {
        success: false,
        statusCode: 500,
        message: error instanceof Error ? error.message : 'Failed to fetch vocabularies'
      };
    }
  }

  /**
   * Get vocabulary by ID
   * GET /vocabularies/:id
   */
  async getVocabularyById(id: number): Promise<ServerResponseModel<VocabularyDto>> {
    try {
      const response = await fetch(`${this.baseUrl}/vocabularies/${id}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch vocabulary');
      
      const data = await response.json();
      return {
        success: true,
        statusCode: 200,
        data
      };
    } catch (error) {
      console.error('Error fetching vocabulary:', error);
      return {
        success: false,
        statusCode: 500,
        message: error instanceof Error ? error.message : 'Failed to fetch vocabulary'
      };
    }
  }

  /**
   * Get vocabularies by topic
   * GET /vocabularies/topic/:topicId
   */
  async getVocabulariesByTopic(topicId: number): Promise<VocabularyDto[]> {
    try {
      const response = await fetch(`${this.baseUrl}/vocabularies/topic/${topicId}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch vocabularies');

      return await response.json();
    } catch (error) {
      console.error('Error fetching vocabularies by topic:', error);
      throw error;
    }
  }

  /**
   * Search vocabularies
   * GET /vocabularies/search?q=hello
   */
  async searchVocabularies(query: string): Promise<VocabularyDto[]> {
    try {
      const response = await fetch(`${this.baseUrl}/vocabularies/search?q=${encodeURIComponent(query)}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to search vocabularies');

      return await response.json();
    } catch (error) {
      console.error('Error searching vocabularies:', error);
      throw error;
    }
  }

  /**
   * Get random vocabularies
   * GET /vocabularies/random?count=10&difficulty=Beginner
   */
  async getRandomVocabularies(count: number = 10, difficulty?: string): Promise<VocabularyDto[]> {
    try {
      const params = new URLSearchParams();
      params.append('count', count.toString());
      if (difficulty) params.append('difficulty', difficulty);

      const response = await fetch(`${this.baseUrl}/vocabularies/random?${params.toString()}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch random vocabularies');

      return await response.json();
    } catch (error) {
      console.error('Error fetching random vocabularies:', error);
      throw error;
    }
  }

  /**
   * Get default vocabularies (reset filter)
   * GET /vocabularies/default
   */
  async getDefaultVocabularies(): Promise<VocabularyDto[]> {
    try {
      const response = await fetch(`${this.baseUrl}/vocabularies/default`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch default vocabularies');

      return await response.json();
    } catch (error) {
      console.error('Error fetching default vocabularies:', error);
      throw error;
    }
  }

  /**
   * Create vocabulary (Admin only)
   * POST /vocabularies
   */
  async createVocabulary(dto: CreateVocabularyDto): Promise<ServerResponseModel<VocabularyDto>> {
    try {
      const response = await fetch(`${this.baseUrl}/vocabularies`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(dto),
      });
      
      if (!response.ok) throw new Error('Failed to create vocabulary');
      
      const data = await response.json();
      return {
        success: true,
        statusCode: 200,
        data
      };
    } catch (error) {
      console.error('Error creating vocabulary:', error);
      return {
        success: false,
        statusCode: 500,
        message: error instanceof Error ? error.message : 'Failed to create vocabulary'
      };
    }
  }

  /**
   * Update vocabulary (Admin only)
   * PUT /vocabularies/:id
   */
  async updateVocabulary(id: number, dto: UpdateVocabularyDto): Promise<ServerResponseModel<VocabularyDto>> {
    try {
      const response = await fetch(`${this.baseUrl}/vocabularies/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(dto),
      });
      
      if (!response.ok) throw new Error('Failed to update vocabulary');
      
      const data = await response.json();
      return {
        success: true,
        statusCode: 200,
        data
      };
    } catch (error) {
      console.error('Error updating vocabulary:', error);
      return {
        success: false,
        statusCode: 500,
        message: error instanceof Error ? error.message : 'Failed to update vocabulary'
      };
    }
  }

  /**
   * Delete vocabulary (Admin only)
   * DELETE /vocabularies/:id
   */
  async deleteVocabulary(id: number): Promise<ServerResponseModel<void>> {
    try {
      const response = await fetch(`${this.baseUrl}/vocabularies/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to delete vocabulary');
      
      return {
        success: true,
        statusCode: 200
      };
    } catch (error) {
      console.error('Error deleting vocabulary:', error);
      return {
        success: false,
        statusCode: 500,
        message: error instanceof Error ? error.message : 'Failed to delete vocabulary'
      };
    }
  }
}

export const vocabularyService = new VocabularyService();