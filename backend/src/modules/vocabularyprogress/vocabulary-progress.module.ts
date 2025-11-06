import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VocabularyProgress } from './entities/vocabulary-progress.entity';
import { VocabularyPracticeController } from './vocabulary-practice.controller';
import { VocabularyProgressService } from './vocabulary-progress.service';
import { Vocabulary } from '../vocabularies/entities/vocabulary.entity';

/**
 * ✅ VocabularyProgressModule
 * - Quản lý progress tracking cho vocabulary
 * - Xử lý practice submissions và bookmarks
 */
@Module({
  imports: [TypeOrmModule.forFeature([VocabularyProgress, Vocabulary])],
  controllers: [VocabularyPracticeController],
  providers: [VocabularyProgressService],
  exports: [
    VocabularyProgressService,
    TypeOrmModule.forFeature([VocabularyProgress]),
  ],
})
export class VocabularyProgressModule {}
