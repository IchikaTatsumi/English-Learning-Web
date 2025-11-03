// src/features/vocabularies/services/vocabulary.service.ts
import { VocabularyDto, VocabularyFilterDto } from '../dtos/vocabulary.dto';
import { mockVocabulary, updateMockVocabulary } from '@/data/mockData';

export class VocabularyService {
  async getVocabularies(filter?: VocabularyFilterDto): Promise<VocabularyDto[]> {
    let filtered = [...mockVocabulary] as VocabularyDto[];

    // Thêm logic filter đơn giản cho Mock data
    if (filter?.isLearned !== undefined) {
      filtered = filtered.filter(v => v.isLearned === filter.isLearned);
    }
    if (filter?.topicId) {
      filtered = filtered.filter(v => v.topicId === filter.topicId);
    }
    if (filter?.difficulty && filter.difficulty !== 'all') {
      filtered = filtered.filter(v => v.difficulty === filter.difficulty);
    }
    if (filter?.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      filtered = filtered.filter(v => 
        v.word.toLowerCase().includes(term) ||
        v.definition.toLowerCase().includes(term)
      );
    }

    return filtered;
  }
  
  // Hàm này đã được sửa lỗi kiểu dữ liệu
  async markAsLearned(id: number): Promise<VocabularyDto> {
    const vocab = mockVocabulary.find(v => v.id === id);
    if (!vocab) throw new Error('Vocabulary not found');

    const updatedVocab = {
      ...vocab, 
      isLearned: true, 
      lastReviewed: new Date().toISOString().split('T')[0],
      topicId: vocab.topicId // Đảm bảo có topicId
    } as VocabularyDto;
    
    // Cập nhật mockData toàn cục
    updateMockVocabulary(id, updatedVocab); 

    return updatedVocab;
  }

  // Thêm mock cho các hàm còn thiếu
  async createVocabulary(): Promise<VocabularyDto> {
    throw new Error('Not implemented for mock');
  }
  
  async getVocabulary(id: number): Promise<VocabularyDto | null> {
      return mockVocabulary.find(v => v.id === id) || null;
  }
}

export const vocabularyService = new VocabularyService();