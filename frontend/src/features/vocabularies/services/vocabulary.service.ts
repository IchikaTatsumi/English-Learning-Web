import { VocabularyDto, CreateVocabularyDto, UpdateVocabularyDto, VocabularyFilterDto } from '../dtos/vocabulary.dto';

export class VocabularyService {
  private baseUrl = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:4000/api';

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  async getVocabularies(filters?: VocabularyFilterDto): Promise<VocabularyDto[]> {
    try {
      const params = new URLSearchParams();
      
      // Backend API: GET /vocabularies/filter
      if (filters?.topic_id) params.append('topicId', filters.topic_id.toString());
      if (filters?.difficulty_level) params.append('difficulty', filters.difficulty_level);
      if (filters?.isLearned !== undefined) params.append('onlyLearned', filters.isLearned.toString());
      if (filters?.searchTerm) params.append('search', filters.searchTerm);

      const response = await fetch(`${this.baseUrl}/vocabularies/filter?${params.toString()}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch vocabularies');
      
      const result = await response.json();
      
      // Backend returns: { data: [], view_mode, total, paginated }
      return result.data.map((v: any) => this.mapBackendToDto(v));
    } catch (error) {
      console.error('Error fetching vocabularies:', error);
      throw error;
    }
  }

  async getVocabularyById(id: number): Promise<VocabularyDto> {
    try {
      const response = await fetch(`${this.baseUrl}/vocabularies/${id}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch vocabulary');
      
      const data = await response.json();
      return this.mapBackendToDto(data);
    } catch (error) {
      console.error('Error fetching vocabulary:', error);
      throw error;
    }
  }

  async createVocabulary(dto: CreateVocabularyDto): Promise<VocabularyDto> {
    try {
      const response = await fetch(`${this.baseUrl}/vocabularies`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          topic_id: dto.topic_id,
          word: dto.word,
          ipa: dto.ipa,
          meaning_en: dto.meaning_en,
          meaning_vi: dto.meaning_vi,
          example_sentence: dto.example_sentence,
          audio_path: dto.audio_path,
          difficulty_level: dto.difficulty_level
        }),
      });
      
      if (!response.ok) throw new Error('Failed to create vocabulary');
      
      const data = await response.json();
      return this.mapBackendToDto(data);
    } catch (error) {
      console.error('Error creating vocabulary:', error);
      throw error;
    }
  }

  async updateVocabulary(id: number, dto: UpdateVocabularyDto): Promise<VocabularyDto> {
    try {
      const response = await fetch(`${this.baseUrl}/vocabularies/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(dto),
      });
      
      if (!response.ok) throw new Error('Failed to update vocabulary');
      
      const data = await response.json();
      return this.mapBackendToDto(data);
    } catch (error) {
      console.error('Error updating vocabulary:', error);
      throw error;
    }
  }

  async deleteVocabulary(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/vocabularies/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to delete vocabulary');
    } catch (error) {
      console.error('Error deleting vocabulary:', error);
      throw error;
    }
  }

  async toggleBookmark(vocabId: number, isBookmarked: boolean): Promise<void> {
    try {
      // Backend API: POST /vocabulary-practice/bookmark
      const response = await fetch(`${this.baseUrl}/vocabulary-practice/bookmark`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          vocab_id: vocabId,
          is_bookmarked: isBookmarked
        }),
      });
      
      if (!response.ok) throw new Error('Failed to toggle bookmark');
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      throw error;
    }
  }

  async submitPractice(vocabId: number, answers: any[]): Promise<any> {
    try {
      // Backend API: POST /vocabulary-practice/submit
      const response = await fetch(`${this.baseUrl}/vocabulary-practice/submit`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          vocab_id: vocabId,
          answers: answers
        }),
      });
      
      if (!response.ok) throw new Error('Failed to submit practice');
      
      return await response.json();
    } catch (error) {
      console.error('Error submitting practice:', error);
      throw error;
    }
  }

  async getLearnedVocabularies(): Promise<VocabularyDto[]> {
    try {
      // Backend API: GET /vocabulary-practice/learned
      const response = await fetch(`${this.baseUrl}/vocabulary-practice/learned`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch learned vocabularies');
      
      const data = await response.json();
      return data.map((item: any) => this.mapBackendToDto(item.vocabulary));
    } catch (error) {
      console.error('Error fetching learned vocabularies:', error);
      throw error;
    }
  }

  async getBookmarkedVocabularies(): Promise<VocabularyDto[]> {
    try {
      // Backend API: GET /vocabulary-practice/bookmarked
      const response = await fetch(`${this.baseUrl}/vocabulary-practice/bookmarked`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch bookmarked vocabularies');
      
      const data = await response.json();
      return data.map((item: any) => this.mapBackendToDto(item.vocabulary));
    } catch (error) {
      console.error('Error fetching bookmarked vocabularies:', error);
      throw error;
    }
  }

  // Map backend response to DTO
  private mapBackendToDto(data: any): VocabularyDto {
    return {
      vocab_id: data.vocab_id || data.id,
      word: data.word,
      ipa: data.ipa || '',
      meaning_en: data.meaning_en,
      meaning_vi: data.meaning_vi,
      example_sentence: data.example_sentence,
      audio_path: data.audio_path,
      difficulty_level: data.difficulty_level,
      topic_id: data.topic_id,
      topic_name: data.topic?.topic_name || '',
      lesson_id: 0, // Not used in backend
      is_learned: data.is_learned || false,
      created_at: data.created_at
    };
  }
}

export const vocabularyService = new VocabularyService();