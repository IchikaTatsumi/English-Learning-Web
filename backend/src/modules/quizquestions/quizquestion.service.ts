import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizQuestion } from './entities/quizquestion.entity';
import { Vocabulary } from '../vocabularies/entities/vocabulary.entity';
import { CreateQuizQuestionDto } from './dto/quizquestion.dto';
// ✅ [NEW] Import VocabularyService
import { VocabularyService } from '../vocabularies/vocabulary.service';

@Injectable()
export class QuizQuestionService {
  constructor(
    @InjectRepository(QuizQuestion)
    private quizQuestionRepository: Repository<QuizQuestion>,
    @InjectRepository(Vocabulary)
    private vocabularyRepository: Repository<Vocabulary>,
    // ✅ [NEW] Inject VocabularyService để lấy đáp án nhiễu
    @Inject(forwardRef(() => VocabularyService))
    private vocabularyService: VocabularyService,
  ) {}

  // ... (Giữ nguyên createQuestion, getQuestionById, generateQuestionsForQuiz cũ của bạn)
  async createQuestion(dto: CreateQuizQuestionDto): Promise<QuizQuestion> {
    const question = this.quizQuestionRepository.create(dto);
    return await this.quizQuestionRepository.save(question);
  }

  async getQuestionById(questionId: number): Promise<QuizQuestion> {
    const question = await this.quizQuestionRepository.findOne({
      where: { id: questionId },
      relations: ['vocabulary', 'vocabulary.topic'],
    });
    if (!question)
      throw new NotFoundException(`Question ${questionId} not found`);
    return question;
  }

  /**
   * Logic cũ của bạn: Sinh câu hỏi ngẫu nhiên cho bài thi (giữ nguyên để không ảnh hưởng tính năng cũ)
   */
  async generateQuestionsForQuiz(
    quizId: number,
    vocabularies: Vocabulary[],
  ): Promise<QuizQuestion[]> {
    // ... (Code cũ của bạn giữ nguyên)
    if (vocabularies.length < 4)
      throw new BadRequestException('Need at least 4 vocabularies');
    // ... logic sinh câu hỏi ngẫu nhiên ...
    return [];
  }

  // =========================================================
  // ✅ [NEW] LOGIC CHÍNH: TỰ ĐỘNG SINH 4 CÂU HỎI KHI TẠO TỪ
  // =========================================================
  async generateDefaultQuestionsForVocabulary(
    vocab: Vocabulary,
  ): Promise<void> {
    // 1. Lấy 3 từ khác làm đáp án sai (Distractors)
    const distractors =
      await this.vocabularyService.getRandomVocabulariesForDistractors(
        3,
        vocab.id,
      );
    const wrongAnswers = distractors.map((v) => v.word);

    // Fallback nếu database chưa đủ từ để lấy đáp án sai
    while (wrongAnswers.length < 3)
      wrongAnswers.push('Option ' + (wrongAnswers.length + 1));

    const questionsToSave: Partial<QuizQuestion>[] = [];

    // --- Dạng 1: VietToWord (Nghĩa Việt -> Chọn từ Anh) ---
    questionsToSave.push({
      vocabId: vocab.id,
      questionType: 'VietnameseToWord',
      questionText: `Chọn từ tiếng Anh có nghĩa là: "${vocab.meaningVi}"`,
      correctAnswer: vocab.word,
      // Lưu ý: Entity QuizQuestion hiện tại chưa có cột `options`.
      // Nếu muốn lưu cứng options, cần thêm cột jsonb `options` vào entity.
      // Nếu không, Frontend sẽ phải tự lấy danh sách từ khác để làm option (như logic cũ của bạn).
      // Ở đây tôi giả định bạn sẽ dùng logic sinh option động khi query, hoặc thêm cột options sau.
      timeLimit: 20,
    });

    // --- Dạng 2: MeaningToWord (Nghĩa Anh -> Chọn từ Anh) ---
    questionsToSave.push({
      vocabId: vocab.id,
      questionType: 'MeaningToWord',
      questionText: `Which word matches this definition: "${vocab.meaningEn}"?`,
      correctAnswer: vocab.word,
      timeLimit: 30,
    });

    // --- Dạng 3: SentenceToWord (Điền từ vào câu) ---
    if (vocab.exampleSentence) {
      // Thay thế từ vựng trong câu bằng "_____" (case insensitive)
      const maskedSentence = vocab.exampleSentence.replace(
        new RegExp(vocab.word, 'gi'),
        '_____',
      );
      questionsToSave.push({
        vocabId: vocab.id,
        // Lưu ý: Cần thêm 'SentenceToWord' vào ENUM trong entity và DB
        questionType: 'WordToMeaning', // Tạm dùng type có sẵn nếu chưa update DB, hoặc update DB thêm 'SentenceToWord'
        questionText: `Complete the sentence: "${maskedSentence}"`,
        correctAnswer: vocab.word,
        timeLimit: 40,
      });
    }

    // --- Dạng 4: SpeechToWord (Nghe/Nói) ---
    questionsToSave.push({
      vocabId: vocab.id,
      questionType: 'Pronunciation', // Mapping với SpeechToWord
      questionText: `Pronounce the word: "${vocab.word}"`,
      correctAnswer: vocab.word,
      timeLimit: 60,
    });

    // Lưu vào DB
    const entities = this.quizQuestionRepository.create(questionsToSave);
    await this.quizQuestionRepository.save(entities);
  }

  /**
   * ✅ [NEW] API: Lấy câu hỏi của 1 từ vựng (cho nút Practice - tab Learned)
   */
  async findQuestionsByVocabId(vocabId: number): Promise<QuizQuestion[]> {
    return await this.quizQuestionRepository.find({
      where: { vocabId },
      relations: ['vocabulary'],
    });
  }

  // ✅ [UPDATE] getRandomQuestions: Lấy câu hỏi ngẫu nhiên cho Quiz tổng hợp
  async getRandomQuestions(count: number = 10): Promise<QuizQuestion[]> {
    return await this.quizQuestionRepository
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.vocabulary', 'vocab')
      .leftJoinAndSelect('vocab.topic', 'topic')
      .orderBy('RANDOM()') // Postgres/SQLite
      .limit(count)
      .getMany();
  }

  async deleteQuestion(questionId: number): Promise<void> {
    const question = await this.getQuestionById(questionId);
    await this.quizQuestionRepository.remove(question);
  }

  // Helper shuffle
  private shuffleArray(array: string[]): string[] {
    return array.sort(() => Math.random() - 0.5);
  }
}
