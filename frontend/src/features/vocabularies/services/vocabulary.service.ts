import { VocabularyDto, CreateVocabularyDto, UpdateVocabularyDto, VocabularyFilterDto } from '../dtos/vocabulary.dto';

export class VocabularyService {
  private baseUrl = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:3000/api';

  async getVocabularies(filters?: VocabularyFilterDto): Promise<VocabularyDto[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.topic_id) params.append('topic_id', filters.topic_id.toString());
      if (filters?.difficulty_level) params.append('difficulty_level', filters.difficulty_level);
      if (filters?.isLearned !== undefined) params.append('is_learned', filters.isLearned.toString());
      if (filters?.searchTerm) params.append('search', filters.searchTerm);

      const response = await fetch(`${this.baseUrl}/vocabularies?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch vocabularies');
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching vocabularies:', error);
      // Return mock data for development
      return this.getMockVocabularies(filters);
    }
  }

  async getVocabularyById(id: number): Promise<VocabularyDto> {
    try {
      const response = await fetch(`${this.baseUrl}/vocabularies/${id}`);
      if (!response.ok) throw new Error('Failed to fetch vocabulary');
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error fetching vocabulary:', error);
      throw error;
    }
  }

  async createVocabulary(dto: CreateVocabularyDto): Promise<VocabularyDto> {
    try {
      const response = await fetch(`${this.baseUrl}/vocabularies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });
      
      if (!response.ok) throw new Error('Failed to create vocabulary');
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error creating vocabulary:', error);
      throw error;
    }
  }

  async updateVocabulary(id: number, dto: UpdateVocabularyDto): Promise<VocabularyDto> {
    try {
      const response = await fetch(`${this.baseUrl}/vocabularies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });
      
      if (!response.ok) throw new Error('Failed to update vocabulary');
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error updating vocabulary:', error);
      throw error;
    }
  }

  async deleteVocabulary(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/vocabularies/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete vocabulary');
    } catch (error) {
      console.error('Error deleting vocabulary:', error);
      throw error;
    }
  }

  async toggleBookmark(vocabId: number, isBookmarked: boolean): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/vocabularies/${vocabId}/bookmark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_learned: isBookmarked }),
      });
      
      if (!response.ok) throw new Error('Failed to toggle bookmark');
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      throw error;
    }
  }

  // Mock data for development
  private getMockVocabularies(filters?: VocabularyFilterDto): VocabularyDto[] {
    const mockData: VocabularyDto[] = [
      {
        vocab_id: 1,
        word: 'Hello',
        ipa: 'həˈloʊ',
        meaning_en: 'A greeting or expression of goodwill',
        meaning_vi: 'Xin chào',
        example_sentence: 'Hello, how are you today?',
        audio_path: '/audio/hello.mp3',
        difficulty_level: 'Beginner',
        topic_id: 1,
        topic_name: 'Greetings',
        lesson_id: 1,
        is_learned: false,
        created_at: '2024-01-15T10:00:00Z'
      },
      {
        vocab_id: 2,
        word: 'Beautiful',
        ipa: 'ˈbjuːtɪfl',
        meaning_en: 'Pleasing to the senses or mind',
        meaning_vi: 'Đẹp',
        example_sentence: 'The sunset is beautiful tonight.',
        audio_path: '/audio/beautiful.mp3',
        difficulty_level: 'Intermediate',
        topic_id: 2,
        topic_name: 'Adjectives',
        lesson_id: 2,
        is_learned: false,
        created_at: '2024-01-16T10:00:00Z'
      },
      {
        vocab_id: 3,
        word: 'Computer',
        ipa: 'kəmˈpjuːtə',
        meaning_en: 'An electronic device for processing data',
        meaning_vi: 'Máy tính',
        example_sentence: 'I use my computer for work every day.',
        audio_path: '/audio/computer.mp3',
        difficulty_level: 'Beginner',
        topic_id: 3,
        topic_name: 'Technology',
        lesson_id: 3,
        is_learned: true,
        created_at: '2024-01-17T10:00:00Z'
      },
    ];

    let filtered = mockData;

    if (filters?.topic_id) {
      filtered = filtered.filter(v => v.topic_id === filters.topic_id);
    }

    if (filters?.difficulty_level) {
      filtered = filtered.filter(v => v.difficulty_level === filters.difficulty_level);
    }

    if (filters?.isLearned !== undefined) {
      filtered = filtered.filter(v => v.is_learned === filters.isLearned);
    }

    if (filters?.searchTerm) {
      const search = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(v => 
        v.word.toLowerCase().includes(search) ||
        v.meaning_en.toLowerCase().includes(search) ||
        v.meaning_vi.toLowerCase().includes(search)
      );
    }

    return filtered;
  }
}

export const vocabularyService = new VocabularyService();