import { IsNumber, IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AutoExpose } from 'src/core/decorators/auto-expose.decorator';
import { Result } from '../entities/result.entity';

export class CreateResultDTO {
  @ApiProperty({ description: 'Quiz ID', required: false })
  @IsNumber()
  @IsOptional()
  quizId?: number; // Quiz ID có thể null nếu là Practice

  @ApiProperty({ description: 'Quiz Question ID' })
  @IsNumber()
  quizQuestionId: number;

  @ApiProperty({ description: 'User answer' })
  @IsString()
  @IsOptional()
  userAnswer?: string;

  @ApiProperty({ description: 'User speech text (from STT)' })
  @IsString()
  @IsOptional()
  userSpeechText?: string;

  @ApiProperty({ description: 'Is answer correct' })
  @IsBoolean()
  isCorrect: boolean;
}

// DTO Trả về (Output chuyển sang snake_case)
@AutoExpose()
export class ResultResponseDto {
  @ApiProperty({ name: 'result_id' })
  result_id: number;

  @ApiProperty({ name: 'quiz_id' })
  quiz_id: number;

  @ApiProperty({ name: 'quiz_question_id' })
  quiz_question_id: number;

  @ApiProperty({ name: 'user_id' })
  user_id: number;

  @ApiProperty({ name: 'user_answer' })
  user_answer: string;

  @ApiProperty({ name: 'user_speech_text' })
  user_speech_text: string;

  @ApiProperty({ name: 'is_correct' })
  is_correct: boolean;

  @ApiProperty({ name: 'created_at' })
  created_at: Date;

  @ApiProperty({ required: false })
  quiz_question?: any;

  // ✅ Hàm mapping thủ công
  static fromEntity(entity: Result): ResultResponseDto {
    const dto = new ResultResponseDto();
    dto.result_id = entity.id;
    dto.quiz_id = entity.quizId;
    dto.quiz_question_id = entity.quizQuestionId;
    dto.user_id = entity.userId;
    dto.user_answer = entity.userAnswer;
    dto.user_speech_text = entity.userSpeechText;
    dto.is_correct = entity.isCorrect;
    dto.created_at = entity.createdAt;

    if (entity.quizQuestion) {
      dto.quiz_question = {
        quiz_question_id: entity.quizQuestion.id,
        question_text: entity.quizQuestion.questionText,
        correct_answer: entity.quizQuestion.correctAnswer,
        question_type: entity.quizQuestion.questionType,
        // Map thêm vocabulary info nếu cần
        vocabulary: entity.quizQuestion.vocabulary
          ? {
              word: entity.quizQuestion.vocabulary.word,
              meaning_en: entity.quizQuestion.vocabulary.meaningEn,
              meaning_vi: entity.quizQuestion.vocabulary.meaningVi,
            }
          : null,
      };
    }
    return dto;
  }

  static fromEntities(entities: Result[]): ResultResponseDto[] {
    return entities.map((e) => ResultResponseDto.fromEntity(e));
  }
}
