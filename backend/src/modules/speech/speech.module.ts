import { Module, forwardRef } from '@nestjs/common';
import { SpeechController } from './speech.controller';
import { SpeechService } from './speech.service';
import { VocabularyModule } from '../vocabularies/vocabulary.module';
import { ResultModule } from '../results/result.module';

@Module({
  imports: [forwardRef(() => VocabularyModule), forwardRef(() => ResultModule)],
  controllers: [SpeechController],
  providers: [SpeechService],
  exports: [SpeechService],
})
export class SpeechModule {}
