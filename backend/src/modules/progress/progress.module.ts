import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Progress } from './entities/progress.entity';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { ResultModule } from '../results/result.module';
import { TopicModule } from '../topics/topic.module';
import { VocabularyModule } from '../vocabularies/vocabulary.module';
import { Result } from '../results/entities/result.entity';
import { Topic } from '../topics/entities/topic.entity';
import { Vocabulary } from '../vocabularies/entities/vocabulary.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([Progress, Result, Topic, Vocabulary]), 
    forwardRef(() => ResultModule), 
    forwardRef(() => TopicModule),
    forwardRef(() => VocabularyModule),
  ],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [ProgressService, TypeOrmModule.forFeature([Progress])],
})
export class ProgressModule {}