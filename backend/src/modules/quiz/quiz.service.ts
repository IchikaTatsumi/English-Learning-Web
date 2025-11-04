import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quiz, QuizMode } from './entities/quiz.entity';
import { QuizQuestion } from '../quizquestions/entities/quizquestion.entity';
import { Vocabulary } from '../vocabularies/entities/vocabulary.entity';
import { Result } from '../results/entities/result.entity';
import { CreateQuizDto, SubmitQuizDto, QuizResultDto } from './dtos/quiz.dto';
import { QuizQuestionService } from '../quizquestions/quizquestion.service';
import { DifficultyLevel } from 'src/core/enums/difficulty-level.enum';

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,
    @InjectRepository(Vocabulary)
    private vocabularyRepository: Repository<Vocabulary>,
    @InjectRepository(Result)
    private resultRepository: Repository<Result>,
    private quizQuestionService: QuizQuestionService,
  ) {}

  async createQuiz(userId: number, dto: CreateQuizDto): Promise<Quiz> {
    // Create quiz entity
    const quiz = this.quizRepository.create({
      userId,
      difficultyMode: this.mapDifficultyToQuizMode(dto.difficultyLevel),
      totalQuestions: dto.totalQuestions || 10,
      score: 0,
    });

    const savedQuiz = await this.quizRepository.save(quiz);

    // Generate questions based on difficulty and filters
    const vocabularies = await this.getVocabulariesForQuiz(
      dto.difficultyLevel,
      dto.totalQuestions || 10,
      dto.topicId,
    );

    if (vocabularies.length === 0) {
      throw new BadRequestException('No vocabularies available for this quiz');
    }

    // Create questions for each vocabulary
    await this.quizQuestionService.generateQuestionsForQuiz(
      savedQuiz.id,
      vocabularies,
    );

    // Return quiz with questions
    return await this.getQuizById(savedQuiz.id, userId);
  }

  async getQuizById(quizId: number, userId: number): Promise<Quiz> {
    const quiz = await this.quizRepository.findOne({
      where: { id: quizId, userId },
      relations: [
        'questions',
        'questions.vocabulary',
        'questions.vocabulary.topic',
      ],
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${quizId} not found`);
    }

    return quiz;
  }

  async getUserQuizzes(userId: number, limit = 20): Promise<Quiz[]> {
    return await this.quizRepository.find({
      where: { userId },
      relations: ['questions'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async submitQuiz(
    quizId: number,
    userId: number,
    dto: SubmitQuizDto,
  ): Promise<QuizResultDto> {
    const quiz = await this.getQuizById(quizId, userId);
    const questions = quiz.questions;
    const results = [];
    let correctCount = 0;

    // Process each answer
    for (const answer of dto.answers) {
      const question = questions.find((q) => q.id === answer.questionId);

      if (!question) {
        continue;
      }

      const isCorrect = this.checkAnswer(question.correctAnswer, answer.answer);

      if (isCorrect) {
        correctCount++;
      }

      // Save result to database
      const result = this.resultRepository.create({
        quizId: quiz.id,
        quizQuestionId: question.id,
        userId,
        userAnswer: answer.answer,
        userSpeechText: answer.speechText,
        isCorrect,
      });
      await this.resultRepository.save(result);

      results.push({
        questionId: question.id,
        questionText: question.questionText,
        userAnswer: answer.answer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        word: question.vocabulary.word,
      });
    }

    // Calculate score
    const score = Math.round((correctCount / questions.length) * 100);

    // Update quiz
    quiz.score = score;
    await this.quizRepository.save(quiz);

    return {
      quizId: quiz.id,
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      score,
      completedAt: new Date(),
      questions: results,
    };
  }

  private checkAnswer(correctAnswer: string, userAnswer: string): boolean {
    const correct = correctAnswer.toLowerCase().trim();
    const user = userAnswer.toLowerCase().trim();

    // Exact match
    if (correct === user) {
      return true;
    }

    // Fuzzy match (allow minor typos)
    const similarity = this.calculateSimilarity(correct, user);
    return similarity >= 0.85;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) {
      return 1.0;
    }

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator,
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  private async getVocabulariesForQuiz(
    difficulty: DifficultyLevel,
    count: number,
    topicId?: number,
  ): Promise<Vocabulary[]> {
    const queryBuilder = this.vocabularyRepository
      .createQueryBuilder('vocab')
      .leftJoinAndSelect('vocab.topic', 'topic');

    // Filter by topic
    if (topicId) {
      queryBuilder.andWhere('vocab.topicId = :topicId', { topicId });
    }

    // Filter by difficulty
    if (difficulty !== DifficultyLevel.MIXED) {
      queryBuilder.andWhere('vocab.difficultyLevel = :difficulty', {
        difficulty,
      });
    }

    // Random order and limit
    queryBuilder.orderBy('RANDOM()').limit(count);

    return await queryBuilder.getMany();
  }

  private mapDifficultyToQuizMode(difficulty: DifficultyLevel): QuizMode {
    const map = {
      [DifficultyLevel.BEGINNER]: QuizMode.BEGINNER_ONLY,
      [DifficultyLevel.INTERMEDIATE]: QuizMode.INTERMEDIATE_ONLY,
      [DifficultyLevel.ADVANCED]: QuizMode.ADVANCED_ONLY,
      [DifficultyLevel.MIXED]: QuizMode.MIXED_LEVELS,
    };
    return map[difficulty] || QuizMode.MIXED_LEVELS;
  }

  async getQuizStatistics(userId: number) {
    const quizzes = await this.quizRepository.find({
      where: { userId },
      relations: ['questions'],
    });

    const completedQuizzes = quizzes.filter((q) => q.score > 0);
    const totalQuizzes = completedQuizzes.length;
    const totalScore = completedQuizzes.reduce(
      (sum, quiz) => sum + quiz.score,
      0,
    );
    const averageScore =
      totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0;

    // Get all results for accuracy calculation
    const results = await this.resultRepository.find({
      where: { userId },
    });

    const totalQuestions = results.length;
    const correctAnswers = results.filter((r) => r.isCorrect).length;
    const accuracy =
      totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0;
    const bestScore =
      completedQuizzes.length > 0
        ? Math.max(...completedQuizzes.map((q) => q.score))
        : 0;

    return {
      totalQuizzes,
      averageScore,
      totalQuestionsAnswered: totalQuestions,
      correctAnswers,
      accuracy,
      bestScore,
      recentQuizzes: quizzes.slice(0, 5),
    };
  }

  async deleteQuiz(quizId: number, userId: number): Promise<void> {
    const quiz = await this.getQuizById(quizId, userId);
    await this.quizRepository.remove(quiz);
  }
}
