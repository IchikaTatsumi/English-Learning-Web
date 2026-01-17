import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DifficultyLevel } from 'src/core/enums/difficulty-level.enum';
import { AutoExpose } from 'src/core/decorators/auto-expose.decorator';
import { Vocabulary } from '../entities/vocabulary.entity';

// 1. DTO tạo mới (Input camelCase)
export class CreateVocabularyDTO {
  @ApiProperty({ description: 'Topic ID' })
  @IsNumber()
  topicId: number;

  @ApiProperty({ description: 'Word' })
  @IsString()
  @IsNotEmpty()
  word: string;

  @ApiProperty({ description: 'IPA', required: false })
  @IsString()
  @IsOptional()
  ipa?: string;

  @ApiProperty({ description: 'Meaning (EN)' })
  @IsString()
  @IsNotEmpty()
  meaningEn: string;

  @ApiProperty({ description: 'Meaning (VI)' })
  @IsString()
  @IsNotEmpty()
  meaningVi: string;

  @ApiProperty({ description: 'Example Sentence', required: false })
  @IsString()
  @IsOptional()
  exampleSentence?: string;

  @ApiProperty({ enum: DifficultyLevel, default: DifficultyLevel.BEGINNER })
  @IsEnum(DifficultyLevel)
  difficultyLevel: DifficultyLevel;
}

// 2. DTO Cập nhật (Kế thừa và làm optional các trường)
export class UpdateVocabularyDTO {
  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  topicId?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  word?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  ipa?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  meaningEn?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  meaningVi?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  exampleSentence?: string;

  @ApiProperty({ required: false, enum: DifficultyLevel })
  @IsEnum(DifficultyLevel)
  @IsOptional()
  difficultyLevel?: DifficultyLevel;
}

// 3. DTO Trả về (Output snake_case)
@AutoExpose()
export class VocabularyDTO {
  @ApiProperty({ name: 'vocab_id' })
  vocab_id: number;

  @ApiProperty({ name: 'topic_id' })
  topic_id: number;

  @ApiProperty({ name: 'topic_name', required: false })
  topic_name?: string;

  @ApiProperty()
  word: string;

  @ApiProperty({ required: false })
  ipa: string;

  @ApiProperty({ name: 'meaning_en' })
  meaning_en: string;

  @ApiProperty({ name: 'meaning_vi' })
  meaning_vi: string;

  @ApiProperty({ name: 'example_sentence' })
  example_sentence: string;

  @ApiProperty({ name: 'difficulty_level' })
  difficulty_level: string;

  @ApiProperty({ name: 'created_at' })
  created_at: Date;

  static fromEntity(entity: Vocabulary): VocabularyDTO {
    const dto = new VocabularyDTO();
    dto.vocab_id = entity.id;
    dto.topic_id = entity.topicId;
    dto.topic_name = entity.topic?.topicName;
    dto.word = entity.word;
    dto.ipa = entity.ipa;
    dto.meaning_en = entity.meaningEn;
    dto.meaning_vi = entity.meaningVi;
    dto.example_sentence = entity.exampleSentence;
    dto.difficulty_level = entity.difficultyLevel;
    dto.created_at = entity.createdAt;
    return dto;
  }

  static fromEntities(entities: Vocabulary[]): VocabularyDTO[] {
    return entities.map((e) => VocabularyDTO.fromEntity(e));
  }
}
