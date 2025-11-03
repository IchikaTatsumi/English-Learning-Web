import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vocabulary } from './entities/vocabulary.entity';
import { VocabularyController } from './vocabulary.controller';
import { VocabularyService } from './vocabulary.service';
import { ResultModule } from '../results/result.module';
import { LessonModule } from '../lessons/lesson.module';
import { TopicModule } from '../topics/topic.module';
import { Result } from '../results/entities/result.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vocabulary, Result]),
    forwardRef(() => LessonModule), 
    forwardRef(() => TopicModule),
    forwardRef(() => ResultModule),
  ],
  controllers: [VocabularyController],
  providers: [VocabularyService],
  exports: [VocabularyService, TypeOrmModule.forFeature([Vocabulary])],
})
export class VocabularyModule {}