import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vocabulary } from './entities/vocabulary.entity';
import { VocabularyProgress } from '../vocabularyprogress/entities/vocabulary-progress.entity';
import { VocabularyController } from './vocabulary.controller';
import { VocabularyPracticeController } from '../vocabularyprogress/vocabulary-practice.controller';
import { VocabularyService } from './vocabulary.service';
import { VocabularyProgressService } from '../vocabularyprogress/vocabulary-progress.service';
import { ResultModule } from '../results/result.module';
import { TopicModule } from '../topics/topic.module';
import { Result } from '../results/entities/result.entity';
import { Topic } from '../topics/entities/topic.entity'; // ✅ Add this

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vocabulary,
      VocabularyProgress,
      Result,
      Topic, // ✅ Add Topic
    ]),
    forwardRef(() => TopicModule),
    forwardRef(() => ResultModule),
  ],
  controllers: [VocabularyController, VocabularyPracticeController],
  providers: [VocabularyService, VocabularyProgressService],
  exports: [
    VocabularyService,
    VocabularyProgressService,
    TypeOrmModule.forFeature([Vocabulary, VocabularyProgress]),
  ],
})
export class VocabularyModule {}
