export interface VocabularyProgressDto {
  vocab_progress_id: number;
  user_id: number;
  vocab_id: number;
  is_learned: boolean;
  is_bookmarked: boolean;
  first_learned_at: string | null;
  last_reviewed_at: string | null;
  practice_attempts: number;
  practice_correct_count: number;
  created_at: string;
  updated_at: string;
}

export interface SubmitPracticeDto {
  vocab_id: number;
  answers: {
    question_id: number;
    question_type: string;
    question_text: string;
    correct_answer: string;
    user_answer: string;
    is_correct: boolean;
  }[];
}

export interface BookmarkVocabDto {
  vocab_id: number;
  is_bookmarked: boolean;
}

export interface VocabularyProgressStatsDto {
  vocab_id: number;
  is_learned: boolean;
  is_bookmarked: boolean;
  first_learned_at: string | null;
  last_reviewed_at: string | null;
  practice_attempts: number;
  practice_correct_count: number;
  accuracy: number;
}

export interface LearnedVocabularyDto {
  vocabulary: {
    vocab_id: number;
    word: string;
    ipa: string;
    meaning_en: string;
    meaning_vi: string;
    example_sentence?: string;
    audio_path?: string;
    difficulty_level: string;
    topic: {
      topic_id: number;
      topic_name: string;
    };
  };
  progress: VocabularyProgressDto;
}