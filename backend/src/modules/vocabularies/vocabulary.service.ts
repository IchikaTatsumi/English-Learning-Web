import {
  Injectable,
  NotFoundException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, IsNull } from 'typeorm';
import { Vocabulary } from './entities/vocabulary.entity';
import { VocabularyProgress } from '../vocabularyprogress/entities/vocabulary-progress.entity';
import { CreateVocabularyDTO, UpdateVocabularyDTO } from './dto/vocabulary.dto';
import { VocabularyFilterDto } from './dto/vocabulary-filter.dto';
import { Result } from '../results/entities/result.entity';
import { DifficultyLevel } from 'src/core/enums/difficulty-level.enum';
import { SpeechClientService } from '../speech/speech-client.service';
// ✅ Import QuizQuestionService để tự động sinh câu hỏi
import { QuizQuestionService } from '../quizquestions/quizquestion.service';

@Injectable()
export class VocabularyService {
  private readonly logger = new Logger(VocabularyService.name);
  private readonly MAX_TTS_RETRIES = 3;
  private readonly TTS_RETRY_DELAY = 2000;

  constructor(
    @InjectRepository(Vocabulary)
    private vocabularyRepository: Repository<Vocabulary>,
    @InjectRepository(VocabularyProgress)
    private progressRepository: Repository<VocabularyProgress>,
    @InjectRepository(Result)
    private resultRepository: Repository<Result>,
    private readonly speechClient: SpeechClientService,
    // ✅ Sử dụng forwardRef để xử lý phụ thuộc vòng với QuizQuestionService
    @Inject(forwardRef(() => QuizQuestionService))
    private quizQuestionService: QuizQuestionService,
  ) {}

  /**
   * ✅ CREATE VOCABULARY
   * Tự động kích hoạt TTS và sinh 4 dạng câu hỏi mặc định ngay khi lưu từ vựng
   */
  async createVocabulary(dto: CreateVocabularyDTO): Promise<Vocabulary> {
    this.logger.log(`📝 Creating vocabulary: ${dto.word}`);

    // 1. Lưu từ vựng vào database
    const vocabulary = this.vocabularyRepository.create(dto);
    const savedVocab = await this.vocabularyRepository.save(vocabulary);

    // 2. Tạo âm thanh TTS chạy ngầm (fire-and-forget)
    void this.generateTTSWithRetry(savedVocab);

    // 3. ✅ Tự động sinh 4 câu hỏi trắc nghiệm & phát âm cho từ này
    try {
      await this.quizQuestionService.generateDefaultQuestionsForVocabulary(
        savedVocab,
      );
      this.logger.log(`✅ Generated quiz questions for: ${savedVocab.word}`);
    } catch (error) {
      this.logger.error(
        `❌ Failed to generate questions for ${savedVocab.word}: ${error.message}`,
      );
    }

    return savedVocab;
  }

  /**
   * ✅ GENERATE TTS WITH RETRY
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

      vocabulary.audioPath = ttsResponse.audio_url;
      await this.vocabularyRepository.save(vocabulary);

      this.logger.log(
        `✅ TTS generated for vocab ${vocabulary.id}: ${ttsResponse.audio_url}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ TTS failed for vocab ${vocabulary.id} (attempt ${attempt})`,
      );
      if (attempt < this.MAX_TTS_RETRIES) {
        await new Promise((resolve) =>
          setTimeout(resolve, this.TTS_RETRY_DELAY * attempt),
        );
        await this.generateTTSWithRetry(vocabulary, attempt + 1);
      }
    }
  }

  /**
   * ✅ GET RANDOM VOCABULARIES FOR DISTRACTORS
   * Lấy các từ vựng ngẫu nhiên làm đáp án nhiễu, loại trừ từ đang xét
   */
  async getRandomVocabulariesForDistractors(
    count: number,
    excludeId: number,
  ): Promise<Vocabulary[]> {
    return await this.vocabularyRepository
      .createQueryBuilder('vocab')
      .where('vocab.id != :id', { id: excludeId })
      .orderBy('RANDOM()')
      .limit(count)
      .getMany();
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📚 CÁC PHƯƠNG THỨC TRUY VẤN (QUERY METHODS)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * ✅ Lấy danh sách mặc định (Sắp xếp A-Z)
   */
  async getDefaultVocabularies(): Promise<Vocabulary[]> {
    return await this.vocabularyRepository.find({
      relations: ['topic'],
      order: { word: 'ASC' },
    });
  }

  /**
   * ✅ Lấy toàn bộ từ vựng
   */
  async getAllVocabularies(): Promise<Vocabulary[]> {
    return await this.vocabularyRepository.find({
      relations: ['topic'],
      order: { word: 'ASC' },
    });
  }

  /**
   * ✅ Lấy từ vựng theo ID Topic
   */
  async getVocabulariesByTopicId(topicId: number): Promise<Vocabulary[]> {
    return await this.vocabularyRepository.find({
      where: { topicId },
      relations: ['topic'],
      order: { word: 'ASC' },
    });
  }

  /**
   * ✅ Tìm kiếm từ vựng theo từ hoặc ý nghĩa
   */
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

  /**
   * ✅ Lấy danh sách từ vựng kèm Bộ lọc và Phân trang (dùng cho API /filter)
   */
  async getVocabulariesWithFilters(
    filters: VocabularyFilterDto,
    userId?: number,
  ) {
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

    if (filters.search?.trim()) {
      queryBuilder.andWhere(
        '(LOWER(vocab.word) LIKE LOWER(:search) OR LOWER(vocab.meaningEn) LIKE LOWER(:search) OR LOWER(vocab.meaningVi) LIKE LOWER(:search))',
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
      queryBuilder.innerJoin(
        'vocabulary_progress',
        'vp',
        'vp.vocab_id = vocab.vocab_id AND vp.user_id = :userId AND vp.is_learned = true',
        { userId },
      );
    }

    return queryBuilder;
  }

  private applySorting(
    queryBuilder: SelectQueryBuilder<Vocabulary>,
    filters: VocabularyFilterDto,
  ) {
    const sortBy = filters.sortBy || 'word';
    const sortOrder = (filters.sortOrder || 'ASC').toUpperCase() as
      | 'ASC'
      | 'DESC';

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
      default:
        queryBuilder.orderBy('vocab.word', 'ASC');
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🛠️ CÁC PHƯƠNG THỨC QUẢN TRỊ (CRUD)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async getVocabularyById(id: number): Promise<Vocabulary> {
    const vocabulary = await this.vocabularyRepository.findOne({
      where: { id },
      relations: ['topic'],
    });
    if (!vocabulary)
      throw new NotFoundException(`Vocabulary with ID ${id} not found`);
    return vocabulary;
  }

  async updateVocabulary(
    id: number,
    dto: UpdateVocabularyDTO,
  ): Promise<Vocabulary> {
    const vocabulary = await this.getVocabularyById(id);
    const wordChanged = dto.word && dto.word !== vocabulary.word;
    Object.assign(vocabulary, dto);
    const updatedVocab = await this.vocabularyRepository.save(vocabulary);
    if (wordChanged) void this.generateTTSWithRetry(updatedVocab);
    return updatedVocab;
  }

  async deleteVocabulary(id: number): Promise<void> {
    const vocabulary = await this.getVocabularyById(id);
    if (vocabulary.audioPath) {
      this.speechClient.deleteAudio(vocabulary.id, 'en').catch(() => {});
    }
    await this.vocabularyRepository.remove(vocabulary);
  }

  /**
   * ✅ Lấy từ ngẫu nhiên (Dùng cho Random Quiz)
   */
  async getRandomVocabularies(
    count: number,
    difficulty?: string,
  ): Promise<Vocabulary[]> {
    const queryBuilder = this.vocabularyRepository
      .createQueryBuilder('vocab')
      .leftJoinAndSelect('vocab.topic', 'topic');
    if (difficulty && difficulty !== 'Mixed Levels') {
      queryBuilder.where('vocab.difficultyLevel = :difficulty', { difficulty });
    }
    return await queryBuilder.orderBy('RANDOM()').limit(count).getMany();
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔊 CÁC PHƯƠNG THỨC HỖ TRỢ TTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async retryFailedTTS(): Promise<{ success: number; failed: number }> {
    const vocabulariesWithoutAudio = await this.vocabularyRepository.find({
      where: { audioPath: IsNull() },
    });
    let successCount = 0;
    let failedCount = 0;
    for (const vocab of vocabulariesWithoutAudio) {
      try {
        await this.generateTTSWithRetry(vocab);
        successCount++;
      } catch {
        failedCount++;
      }
    }
    return { success: successCount, failed: failedCount };
  }

  async checkTTSStatus(
    vocabId: number,
  ): Promise<{ ready: boolean; audioPath: string | null }> {
    const vocabulary = await this.getVocabularyById(vocabId);
    return { ready: !!vocabulary.audioPath, audioPath: vocabulary.audioPath };
  }
}
