import { DifficultyLevel } from '@/lib/constants/enums';

// ✅ 1. Main DTO (Khớp với Backend snake_case)
export interface VocabularyDto {
  vocab_id: number;
  topic_id: number;
  word: string;
  ipa?: string;
  meaning_en: string;
  meaning_vi: string;
  example_sentence?: string;
  // ❌ Đã xóa audio_path
  difficulty_level: DifficultyLevel;
  created_at: string;
  
  // Các trường bổ sung từ Relation hoặc logic phụ
  topic_name?: string;
  is_learned?: boolean;
  is_bookmarked?: boolean;
  topic?: {
    topic_id: number;
    topic_name: string;
    description?: string;
  };
}

// ✅ 2. Create DTO (Dùng cho Form thêm mới)
export interface CreateVocabularyDto {
  topic_id: number;
  word: string;
  ipa?: string;
  meaning_en: string;
  meaning_vi: string;
  example_sentence?: string;
  difficulty_level: DifficultyLevel;
}

// ✅ 3. Update DTO
export interface UpdateVocabularyDto {
  topic_id?: number;
  word?: string;
  ipa?: string;
  meaning_en?: string;
  meaning_vi?: string;
  example_sentence?: string;
  difficulty_level?: DifficultyLevel;
}

// ✅ 4. Filter DTO (Dùng cho thanh tìm kiếm/lọc)
export interface VocabularyFilterDto {
  search?: string;
  difficulty?: DifficultyLevel | 'all';
  topic_id?: number;
  only_learned?: boolean;
  recently_learned?: boolean;
  view_mode?: 'List' | 'Grid';
  paginate?: boolean;
  page?: number;
  limit?: number;
  sort_by?: 'word' | 'created_at' | 'difficulty_level' | 'first_learned_at';
  sort_order?: 'ASC' | 'DESC';
  
  // Alias hỗ trợ frontend cũ
  searchTerm?: string;
  isLearned?: boolean;
  difficulty_level?: DifficultyLevel | 'all';
}

// ✅ 5. Response DTO (Dùng cho kết quả trả về từ API filter)
export interface VocabularyListResponseDto {
  data: VocabularyDto[];
  view_mode: 'List' | 'Grid';
  total: number;
  paginated: boolean;
  page?: number;
  limit?: number;
  total_pages?: number;
  filters?: {
    search?: string;
    difficulty?: DifficultyLevel;
    topic_id?: number;
    only_learned?: boolean;
    recently_learned?: boolean;
  };
}

// ✅ 6. Progress DTO (Dùng cho thống kê)
export interface VocabularyWithProgressDto extends VocabularyDto {
  is_learned: boolean;
  is_bookmarked: boolean;
  first_learned_at?: string;
  last_reviewed_at?: string;
  practice_attempts: number;
  practice_correct_count: number;
  accuracy: number;
}