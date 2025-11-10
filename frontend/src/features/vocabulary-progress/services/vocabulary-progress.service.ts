import {
  SubmitPracticeDto,
  BookmarkVocabDto,
  VocabularyProgressStatsDto,
  LearnedVocabularyDto,
} from '../dtos/vocabulary-progress.dto';

class VocabularyProgressService {
  private baseUrl = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:4000/api';

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  async submitPractice(dto: SubmitPracticeDto): Promise<VocabularyProgressStatsDto> {
    try {
      const response = await fetch(`${this.baseUrl}/vocabulary-practice/submit`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(dto),
      });

      if (!response.ok) throw new Error('Failed to submit practice');

      return await response.json();
    } catch (error) {
      console.error('Error submitting practice:', error);
      throw error;
    }
  }

  async toggleBookmark(dto: BookmarkVocabDto): Promise<VocabularyProgressStatsDto> {
    try {
      const response = await fetch(`${this.baseUrl}/vocabulary-practice/bookmark`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(dto),
      });

      if (!response.ok) throw new Error('Failed to toggle bookmark');

      return await response.json();
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      throw error;
    }
  }

  async getLearnedVocabularies(): Promise<LearnedVocabularyDto[]> {
    try {
      const response = await fetch(`${this.baseUrl}/vocabulary-practice/learned`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch learned vocabularies');

      return await response.json();
    } catch (error) {
      console.error('Error fetching learned vocabularies:', error);
      throw error;
    }
  }

  async getBookmarkedVocabularies(): Promise<LearnedVocabularyDto[]> {
    try {
      const response = await fetch(`${this.baseUrl}/vocabulary-practice/bookmarked`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch bookmarked vocabularies');

      return await response.json();
    } catch (error) {
      console.error('Error fetching bookmarked vocabularies:', error);
      throw error;
    }
  }

  async getProgressStats(vocabId: number): Promise<VocabularyProgressStatsDto> {
    try {
      const response = await fetch(`${this.baseUrl}/vocabulary-practice/${vocabId}/stats`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch progress stats');

      return await response.json();
    } catch (error) {
      console.error('Error fetching progress stats:', error);
      throw error;
    }
  }
}

export const vocabularyProgressService = new VocabularyProgressService();