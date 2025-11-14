import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Vocabulary } from './entities/vocabulary.entity';
import { VocabularyProgress } from '../vocabularyprogress/entities/vocabulary-progress.entity';
import { CreateVocabularyDTO, UpdateVocabularyDTO } from './dto/vocabulary.dto';
import { VocabularyFilterDto } from './dto/vocabulary-filter.dto';
import { Result } from '../results/entities/result.entity';
import { DifficultyLevel } from 'src/core/enums/difficulty-level.enum';
import { SpeechClientService } from '../speech/speech-client.service';

@Injectable()
export class VocabularyService {
  private readonly logger = new Logger(VocabularyService.name);
  private readonly MAX_TTS_RETRIES = 3;
  private readonly TTS_RETRY_DELAY = 2000; // 2 seconds

  constructor(
    @InjectRepository(Vocabulary)
    private vocabularyRepository: Repository<Vocabulary>,
    @InjectRepository(VocabularyProgress)
    private progressRepository: Repository<VocabularyProgress>,
    @InjectRepository(Result)
    private resultRepository: Repository<Result>,
    private readonly speechClient: SpeechClientService,
  ) {}

  /**
   * ✅ CREATE VOCABULARY WITH AUTOMATIC TTS GENERATION
   * - Create vocabulary immediately
   * - Generate TTS in background with retry mechanism
   * - Update audio URL when ready
   */
  async createVocabulary(dto: CreateVocabularyDTO): Promise<Vocabulary> {
    this.logger.log(`📝 Creating vocabulary: ${dto.word}`);

    // 1. Create vocabulary immediately (without audio)
    const vocabulary = this.vocabularyRepository.create(dto);
    const savedVocab = await this.vocabularyRepository.save(vocabulary);

    // 2. ✅ Generate TTS asynchronously with retry
    this.generateTTSWithRetry(savedVocab);

    // 3. Return immediately (frontend will handle loading state)
    return savedVocab;
  }

  /**
   * ✅ GENERATE TTS WITH AUTOMATIC RETRY MECHANISM
   * Private method called asynchronously
   */
  private async generateTTSWithRetry(
    vocabulary: Vocabulary,
    attempt: number = 1,
  ): Promise<void> {
    try {
      this.logger.log(
        `🔊 Generating TTS for vocab ${vocabulary.id} (attempt ${attempt}/${this.MAX_TTS_RETRIES})`,
      );

      const ttsResponse = await this.speechClient.generateTTS({
        text: vocabulary.word,
        language: 'en',
        vocab_id: vocabulary.id,
      });

      // Update vocabulary with audio URL
      vocabulary.audioPath = ttsResponse.audio_url;
      await this.vocabularyRepository.save(vocabulary);

      this.logger.log(
        `✅ TTS generated successfully for vocab ${vocabulary.id}: ${ttsResponse.audio_url}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ TTS generation failed for vocab ${vocabulary.id} (attempt ${attempt}): ${error.message}`,
      );

      // Retry if not exceeded max attempts
      if (attempt < this.MAX_TTS_RETRIES) {
        this.logger.log(
          `⏳ Retrying TTS generation for vocab ${vocabulary.id} in ${this.TTS_RETRY_DELAY}ms...`,
        );

        // Wait before retry
        await new Promise((resolve) =>
          setTimeout(resolve, this.TTS_RETRY_DELAY * attempt),
        );

        // Retry with incremented attempt
        await this.generateTTSWithRetry(vocabulary, attempt + 1);
      } else {
        this.logger.error(
          `❌ Max retries exceeded for vocab ${vocabulary.id}. TTS generation failed permanently.`,
        );
      }
    }
  }

  /**
   * ✅ RETRY TTS FOR VOCABULARIES WITHOUT AUDIO
   * Can be called manually or via cron job
   */
  async retryFailedTTS(): Promise<{ success: number; failed: number }> {
    this.logger.log('🔄 Starting TTS retry for vocabularies without audio...');

    const vocabulariesWithoutAudio = await this.vocabularyRepository.find({
      where: { audioPath: null },
    });

    this.logger.log(
      `Found ${vocabulariesWithoutAudio.length} vocabularies without audio`,
    );

    let successCount = 0;
    let failedCount = 0;

    for (const vocab of vocabulariesWithoutAudio) {
      try {
        await this.generateTTSWithRetry(vocab);
        successCount++;
      } catch (error) {
        failedCount++;
      }
    }

    this.logger.log(
      `✅ TTS retry completed: ${successCount} success, ${failedCount} failed`,
    );

    return { success: successCount, failed: failedCount };
  }

  /**
   * ✅ CHECK IF TTS IS READY FOR VOCABULARY
   * Frontend can poll this endpoint
   */
  async checkTTSStatus(vocabId: number): Promise<{
    ready: boolean;
    audioPath: string | null;
  }> {
    const vocabulary = await this.getVocabularyById(vocabId);
    return {
      ready: !!vocabulary.audioPath,
      audioPath: vocabulary.audioPath,
    };
  }

  /**
   * ✅ UPDATE VOCABULARY (regenerate TTS if word changed)
   */
  async updateVocabulary(
    id: number,
    dto: UpdateVocabularyDTO,
  ): Promise<Vocabulary> {
    const vocabulary = await this.getVocabularyById(id);
    const wordChanged = dto.word && dto.word !== vocabulary.word;

    Object.assign(vocabulary, dto);
    const updatedVocab = await this.vocabularyRepository.save(vocabulary);

    // Regenerate TTS if word changed (async)
    if (wordChanged) {
      this.logger.log(`🔄 Word changed, regenerating TTS for vocab ${id}`);
      this.generateTTSWithRetry(updatedVocab);
    }

    return updatedVocab;
  }

  /**
   * ✅ DELETE VOCABULARY (cleanup audio file)
   */
  async deleteVocabulary(id: number): Promise<void> {
    const vocabulary = await this.getVocabularyById(id);

    // Delete audio file from MinIO (async, don't wait)
    if (vocabulary.audioPath) {
      this.speechClient.deleteAudio(vocabulary.id, 'en').catch((error) => {
        this.logger.warn(`Failed to delete audio: ${error.message}`);
      });
    }

    await this.vocabularyRepository.remove(vocabulary);
    this.logger.log(`✅ Vocabulary ${id} deleted`);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📚 EXISTING METHODS (unchanged)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async getVocabulariesWithFilters(
    filters: VocabularyFilterDto,
    userId?: number,
  ): Promise<{ data: Vocabulary[]; total: number }> {
    const queryBuilder = this.createFilteredQuery(filters, userId);
    this.applySorting(queryBuilder, filters);

    if (filters.paginate) {
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip).take(limit);
    }

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total };
  }

  private createFilteredQuery(
    filters: VocabularyFilterDto,
    userId?: number,
  ): SelectQueryBuilder<Vocabulary> {
    const queryBuilder = this.vocabularyRepository
      .createQueryBuilder('vocab')
      .leftJoinAndSelect('vocab.topic', 'topic');

    if (filters.search && filters.search.trim()) {
      queryBuilder.andWhere(
        '(LOWER(vocab.word) LIKE LOWER(:search) OR ' +
          'LOWER(vocab.meaningEn) LIKE LOWER(:search) OR ' +
          'LOWER(vocab.meaningVi) LIKE LOWER(:search))',
        { search: `%${filters.search.trim()}%` },
      );
    }

    if (filters.difficulty && filters.difficulty !== DifficultyLevel.MIXED) {
      queryBuilder.andWhere('vocab.difficultyLevel = :difficulty', {
        difficulty: filters.difficulty,
      });
    }

    if (filters.topicId) {
      queryBuilder.andWhere('vocab.topicId = :topicId', {
        topicId: filters.topicId,
      });
    }

    if (filters.onlyLearned && userId) {
      queryBuilder
        .innerJoin(
          'vocabulary_progress',
          'vp',
          'vp.vocab_id = vocab.vocab_id AND vp.user_id = :userId AND vp.is_learned = true',
          { userId },
        )
        .addSelect('vp.first_learned_at', 'firstLearnedAt');
    }

    return queryBuilder;
  }

  private applySorting(
    queryBuilder: SelectQueryBuilder<Vocabulary>,
    filters: VocabularyFilterDto,
  ): void {
    const sortBy = filters.sortBy || 'word';
    const sortOrder = (filters.sortOrder || 'ASC').toUpperCase() as
      | 'ASC'
      | 'DESC';

    if (filters.recentlyLearned && filters.onlyLearned) {
      queryBuilder.orderBy('vp.first_learned_at', 'DESC');
      return;
    }

    switch (sortBy) {
      case 'word':
        queryBuilder.orderBy('vocab.word', sortOrder);
        break;
      case 'createdAt':
        queryBuilder.orderBy('vocab.createdAt', sortOrder);
        break;
      case 'difficultyLevel':
        queryBuilder.orderBy('vocab.difficultyLevel', sortOrder);
        break;
      case 'firstLearnedAt':
        if (filters.onlyLearned) {
          queryBuilder.orderBy('vp.first_learned_at', sortOrder);
        } else {
          queryBuilder.orderBy('vocab.createdAt', sortOrder);
        }
        break;
      default:
        queryBuilder.orderBy('vocab.word', 'ASC');
    }
  }

  async getDefaultVocabularies(): Promise<Vocabulary[]> {
    return await this.vocabularyRepository.find({
      relations: ['topic'],
      order: { word: 'ASC' },
    });
  }

  async getAllVocabularies(): Promise<Vocabulary[]> {
    return await this.vocabularyRepository.find({
      relations: ['topic'],
      order: { word: 'ASC' },
    });
  }

  async getVocabularyById(id: number): Promise<Vocabulary> {
    const vocabulary = await this.vocabularyRepository.findOne({
      where: { id },
      relations: ['topic'],
    });

    if (!vocabulary) {
      throw new NotFoundException(`Vocabulary with ID ${id} not found`);
    }

    return vocabulary;
  }

  async getVocabulariesByTopicId(topicId: number): Promise<Vocabulary[]> {
    return await this.vocabularyRepository.find({
      where: { topicId },
      relations: ['topic'],
      order: { word: 'ASC' },
    });
  }

  async searchVocabularies(query: string): Promise<Vocabulary[]> {
    return await this.vocabularyRepository
      .createQueryBuilder('vocab')
      .leftJoinAndSelect('vocab.topic', 'topic')
      .where(
        '(LOWER(vocab.word) LIKE LOWER(:query) OR ' +
          'LOWER(vocab.meaningEn) LIKE LOWER(:query) OR ' +
          'LOWER(vocab.meaningVi) LIKE LOWER(:query))',
        { query: `%${query}%` },
      )
      .orderBy('vocab.word', 'ASC')
      .getMany();
  }

  async getRandomVocabularies(
    count: number,
    difficulty?: string,
  ): Promise<Vocabulary[]> {
    const queryBuilder = this.vocabularyRepository
      .createQueryBuilder('vocab')
      .leftJoinAndSelect('vocab.topic', 'topic');

    if (difficulty && difficulty !== 'Mixed Levels') {
      queryBuilder.where('vocab.difficultyLevel = :difficulty', {
        difficulty,
      });
    }

    return await queryBuilder.orderBy('RANDOM()').limit(count).getMany();
  }
}
