import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Result } from './entities/result.entity';
import { CreateResultDTO } from './dto/result.dto';
// ✅ Import Services
import { QuizQuestionService } from '../quizquestions/quizquestion.service';
import { VocabularyProgressService } from '../vocabularyprogress/vocabulary-progress.service';

@Injectable()
export class ResultService {
  constructor(
    @InjectRepository(Result)
    private resultRepository: Repository<Result>,
    // ✅ Inject thêm 2 service này
    private readonly quizQuestionService: QuizQuestionService,
    private readonly vocabProgressService: VocabularyProgressService,
  ) {}

  async createResult(userId: number, dto: CreateResultDTO): Promise<Result> {
    // 1. Lấy thông tin câu hỏi để biết vocabId
    const question = await this.quizQuestionService.getQuestionById(
      dto.quizQuestionId,
    );

    // 2. Tạo và lưu kết quả vào bảng Result
    const result = this.resultRepository.create({
      ...dto,
      userId,
    });
    const savedResult = await this.resultRepository.save(result);

    // 3. ✅ LOGIC MỚI: Tự động cập nhật tiến độ học tập (VocabularyProgress)
    // Giúp hệ thống biết user đã học từ này bao nhiêu lần, đúng hay sai
    if (question && question.vocabId) {
      await this.vocabProgressService.updateProgressAfterPractice(
        userId,
        question.vocabId,
        dto.isCorrect,
      );
    }

    return savedResult;
  }

  // --- Các hàm Query khác giữ nguyên ---

  async getResultsByUserId(userId: number): Promise<Result[]> {
    return await this.resultRepository.find({
      where: { userId },
      relations: ['quizQuestion', 'quizQuestion.vocabulary', 'quiz'],
      order: { createdAt: 'DESC' },
    });
  }

  async getResultsByQuizId(quizId: number, userId: number): Promise<Result[]> {
    return await this.resultRepository.find({
      where: { quizId, userId },
      relations: ['quizQuestion', 'quizQuestion.vocabulary'],
      order: { id: 'ASC' },
    });
  }

  async getResultsByVocabId(
    vocabId: number,
    userId: number,
  ): Promise<Result[]> {
    return await this.resultRepository
      .createQueryBuilder('result')
      .leftJoinAndSelect('result.quizQuestion', 'quizQuestion')
      .where('result.userId = :userId', { userId })
      .andWhere('quizQuestion.vocabId = :vocabId', { vocabId })
      .orderBy('result.createdAt', 'DESC')
      .getMany();
  }

  async getBestScoreForVocab(vocabId: number, userId: number): Promise<number> {
    const results = await this.getResultsByVocabId(vocabId, userId);
    if (results.length === 0) return 0;
    const correctCount = results.filter((r) => r.isCorrect).length;
    const totalCount = results.length;
    return Math.round((correctCount / totalCount) * 100);
  }

  async getRecentResults(
    userId: number,
    limit: number = 10,
  ): Promise<Result[]> {
    return await this.resultRepository.find({
      where: { userId },
      relations: ['quizQuestion', 'quizQuestion.vocabulary', 'quiz'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getUserStatistics(userId: number) {
    const results = await this.resultRepository.find({ where: { userId } });
    const totalQuestions = results.length;
    const correctAnswers = results.filter((r) => r.isCorrect).length;
    const accuracy =
      totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0;
    return { totalQuestions, correctAnswers, accuracy };
  }

  async deleteResult(resultId: number, userId: number): Promise<void> {
    const result = await this.resultRepository.findOne({
      where: { id: resultId, userId },
    });
    if (!result)
      throw new NotFoundException(`Result with ID ${resultId} not found`);
    await this.resultRepository.remove(result);
  }
}
