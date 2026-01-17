import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vocabulary } from './entities/vocabulary.entity';
import { CreateVocabularyDTO } from './dto/vocabulary.dto';
import { SpeechClientService } from '../speech/speech-client.service';

@Injectable()
export class VocabularyService {
  private readonly logger = new Logger(VocabularyService.name);
  private readonly MAX_TTS_RETRIES = 3;
  private readonly TTS_RETRY_DELAY = 2000;

  constructor(
    @InjectRepository(Vocabulary)
    private vocabularyRepository: Repository<Vocabulary>,
    private readonly speechClient: SpeechClientService,
  ) {}

  async createVocabulary(dto: CreateVocabularyDTO): Promise<Vocabulary> {
    const vocabulary = this.vocabularyRepository.create(dto);
    const savedVocab = await this.vocabularyRepository.save(vocabulary);

    // Kích hoạt tạo audio chạy ngầm
    void this.generateTTSWithRetry(savedVocab);

    return savedVocab;
  }

  private async generateTTSWithRetry(
    vocabulary: Vocabulary,
    attempt: number = 1,
  ): Promise<void> {
    try {
      const ttsResponse = await this.speechClient.generateTTS({
        text: vocabulary.word,
        language: 'en',
        vocab_id: vocabulary.id,
      });

      vocabulary.audioPath = ttsResponse.audio_url;
      await this.vocabularyRepository.save(vocabulary);
    } catch {
      // Bỏ biến 'error' để tránh lỗi unused
      if (attempt < this.MAX_TTS_RETRIES) {
        await new Promise((res) =>
          setTimeout(res, this.TTS_RETRY_DELAY * attempt),
        );
        return this.generateTTSWithRetry(vocabulary, attempt + 1);
      }
      this.logger.error(
        `Failed to generate TTS for ${vocabulary.word} after ${this.MAX_TTS_RETRIES} attempts`,
      );
    }
  }

  // Các phương thức khác...
  async getAllVocabularies(): Promise<Vocabulary[]> {
    return await this.vocabularyRepository.find({ relations: ['topic'] });
  }

  async getVocabularyById(id: number): Promise<Vocabulary | null> {
    return await this.vocabularyRepository.findOne({
      where: { id },
      relations: ['topic'],
    });
  }

  async deleteVocabulary(id: number): Promise<void> {
    const vocab = await this.getVocabularyById(id);
    if (vocab) {
      await this.vocabularyRepository.remove(vocab);
    }
  }
}
