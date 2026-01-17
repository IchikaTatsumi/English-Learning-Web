import { IsNumber, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AutoExpose } from 'src/core/decorators/auto-expose.decorator';
import { QuizQuestion } from '../entities/quizquestion.entity';

// 1. DTO tạo mới (Input giữ nguyên camelCase theo chuẩn JS)
export class CreateQuizQuestionDto {
  @ApiProperty({ description: 'Vocabulary ID' })
  @IsNumber()
  vocabId: number;

  @ApiProperty({
    description: 'Type of question',
    enum: [
      'WordToMeaning',
      'MeaningToWord',
      'VietnameseToWord',
      'Pronunciation',
      'SentenceToWord', // ✅ Đã thêm
      'SpeechToWord', // ✅ Đã thêm
    ],
  })
  @IsString()
  questionType: string;

  @ApiProperty({ description: 'Question text' })
  @IsString()
  questionText: string;

  @ApiProperty({ description: 'Correct answer' })
  @IsString()
  correctAnswer: string;

  @ApiProperty({ description: 'Time limit in seconds', default: 30 })
  @IsNumber()
  @IsOptional()
  timeLimit?: number;
}

// 2. DTO Trả về (Output chuyển sang snake_case để khớp Frontend & DB)
@AutoExpose()
export class QuizQuestionResponseDto {
  @ApiProperty({ name: 'quiz_question_id' })
  quiz_question_id: number;

  @ApiProperty({ name: 'vocab_id' })
  vocab_id: number;

  @ApiProperty({ name: 'question_type' })
  question_type: string;

  @ApiProperty({ name: 'question_text' })
  question_text: string;

  @ApiProperty({ name: 'correct_answer' })
  correct_answer: string;

  @ApiProperty({ name: 'time_limit' })
  time_limit: number;

  @ApiProperty({ name: 'created_at' })
  created_at: Date;

  @ApiProperty({ required: false })
  vocabulary?: any; // Có thể define chi tiết nếu cần

  // ✅ Hàm mapping thủ công
  static fromEntity(entity: QuizQuestion): QuizQuestionResponseDto {
    const dto = new QuizQuestionResponseDto();
    dto.quiz_question_id = entity.id;
    dto.vocab_id = entity.vocabId;
    dto.question_type = entity.questionType;
    dto.question_text = entity.questionText;
    dto.correct_answer = entity.correctAnswer;
    dto.time_limit = entity.timeLimit;
    dto.created_at = entity.createdAt;

    if (entity.vocabulary) {
      dto.vocabulary = {
        vocab_id: entity.vocabulary.id,
        word: entity.vocabulary.word,
        meaning_en: entity.vocabulary.meaningEn,
        meaning_vi: entity.vocabulary.meaningVi,
        ipa: entity.vocabulary.ipa,
        difficulty_level: entity.vocabulary.difficultyLevel,
      };
    }
    return dto;
  }

  static fromEntities(entities: QuizQuestion[]): QuizQuestionResponseDto[] {
    return entities.map((e) => QuizQuestionResponseDto.fromEntity(e));
  }
}

export class AnswerQuizQuestionDto {
  @ApiProperty({ description: 'User answer' })
  @IsString()
  userAnswer: string;

  @ApiProperty({ description: 'Speech text from STT', required: false })
  @IsString()
  @IsOptional()
  speechText?: string;
}
