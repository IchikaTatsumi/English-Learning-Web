import { VocabularyDto, CreateVocabularyDto, UpdateVocabularyDto, VocabularyFilterDto } from '../dtos/vocabulary.dto';
import { mockVocabulary } from '@/data/mockData';

export class VocabularyService {
  async getVocabularies(filter?: VocabularyFilterDto): Promise<VocabularyDto[]> {
    // Mock implementation - replace with actual API call
    let filtered = mockVocabulary;

    if (filter) {
      if (filter.topicId) {
        filtered = filtered.filter(v => v.category === filter.topicId);
      }
      if (filter.difficulty) {
        filtered = filtered.filter(v => v.difficulty === filter.difficulty);
      }
      if (filter.isLearned !== undefined) {
        filtered = filtered.filter(v => v.isLearned === filter.isLearned);
      }
      if (filter.searchTerm) {
        const term = filter.searchTerm.toLowerCase();
        filtered = filtered.filter(v => 
          v.word.toLowerCase().includes(term) || 
          v.definition.toLowerCase().includes(term)
        );
      }
    }

    return filtered.map(v => ({
      ...v,
      topicId: v.category
    }));
  }

  async getVocabulary(id: string): Promise<VocabularyDto | null> {
    // Mock implementation - replace with actual API call
    const vocabulary = mockVocabulary.find(v => v.id === id);
    if (!vocabulary) return null;

    return {
      ...vocabulary,
      topicId: vocabulary.category
    };
  }

  async createVocabulary(dto: CreateVocabularyDto): Promise<VocabularyDto> {
    // Mock implementation - replace with actual API call
    const newVocabulary: VocabularyDto = {
      id: Date.now().toString(),
      ...dto,
      isLearned: false,
      dateAdded: new Date().toISOString()
    };

    return newVocabulary;
  }

  async updateVocabulary(id: string, dto: UpdateVocabularyDto): Promise<VocabularyDto> {
    // Mock implementation - replace with actual API call
    const vocabulary = await this.getVocabulary(id);
    if (!vocabulary) {
      throw new Error('Vocabulary not found');
    }

    return {
      ...vocabulary,
      ...dto
    };
  }

  async deleteVocabulary(id: string): Promise<void> {
    // Mock implementation - replace with actual API call
    return Promise.resolve();
  }

  async markAsLearned(id: string): Promise<VocabularyDto> {
    // Mock implementation - replace with actual API call
    return this.updateVocabulary(id, { 
      isLearned: true, 
      lastReviewed: new Date().toISOString() 
    });
  }
}

export const vocabularyService = new VocabularyService();
