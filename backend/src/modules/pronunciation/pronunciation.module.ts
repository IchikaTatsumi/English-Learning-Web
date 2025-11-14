import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PronunciationController } from './pronunciation.controller';
import { PronunciationService } from './pronunciation.service';
import { VocabularyModule } from '../vocabularies/vocabulary.module';
import { SpeechModule } from '../speech/speech.module';
import { VocabularyProgressModule } from '../vocabularyprogress/vocabulary-progress.module';
import { PronunciationAttempt } from './entities/pronunciation-attempt.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PronunciationAttempt]),
    VocabularyModule,
    SpeechModule,
    VocabularyProgressModule,
  ],
  controllers: [PronunciationController],
  providers: [PronunciationService],
  exports: [PronunciationService],
})
export class PronunciationModule {}
