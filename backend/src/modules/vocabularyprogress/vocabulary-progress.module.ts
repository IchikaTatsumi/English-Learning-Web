import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vocabulary } from './entities/vocabulary.entity';
import { VocabularyController } from './vocabulary.controller';
import { VocabularyService } from './vocabulary.service';
import { ResultModule } from '../results/result.module';
import { TopicModule } from '../topics/topic.module';
import { Result } from '../results/entities/result.entity';
import { VocabularyProgressModule } from '../vocabularyprogress/vocabulary-progress.module'; // ✅ Import

/**
 * ✅ VocabularyModule
 * - Quản lý CRUD vocabulary
 * - Tích hợp với VocabularyProgressModule để track tiến độ
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Vocabulary, Result]),
    forwardRef(() => TopicModule),
    forwardRef(() => ResultModule),
    forwardRef(() => VocabularyProgressModule), // ✅ Import VocabularyProgressModule
  ],
  controllers: [VocabularyController],
  providers: [VocabularyService],
  exports: [VocabularyService, TypeOrmModule.forFeature([Vocabulary])],
})
export class VocabularyModule {}
