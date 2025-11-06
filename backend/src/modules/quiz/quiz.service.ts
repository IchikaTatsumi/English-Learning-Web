import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Quiz,
  QuizMode,
  DIFFICULTY_TO_QUIZ_MODE,
} from './entities/quiz.entity';
import { Vocabulary } from '../vocabularies/entities/vocabulary.entity';
import { Result } from '../results/entities/result.entity';
import { QuizQuestion } from '../quizquestions/entities/quizquestion.entity';
import { CreateQuizDto, SubmitQuizDto, QuizResultDto } from './dto/quiz.dto';

interface QuestionResult {
  questionId: number;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  word: string;
}

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,
    @InjectRepository(Vocabulary)
    private vocabularyRepository: Repository<Vocabulary>,
    @InjectRepository(Result)
    private resultRepository: Repository<Result>,
    @InjectRepository(QuizQuestion)
    private quizQuestionRepository: Repository<QuizQuestion>,
  ) {}

  async createQuiz(userId: number, dto: CreateQuizDto): Promise<Quiz> {
    const difficultyMode =
      DIFFICULTY_TO_QUIZ_MODE[dto.difficultyLevel] || QuizMode.MIXED_LEVELS;

    const quiz = this.quizRepository.create({
      userId,
      difficultyMode,
      totalQuestions: dto.totalQuestions || 10,
      score: 0,
    });

    const savedQuiz = await this.quizRepository.save(quiz);

    const randomQuestions = await this.getRandomQuizQuestions(
      dto.totalQuestions || 10,
      dto.difficultyLevel,
      dto.topicId,
    );

    if (randomQuestions.length === 0) {
      throw new BadRequestException(
        'No questions available for this quiz configuration',
      );
    }

    return await this.getQuizById(savedQuiz.id, userId);
  }

  /**
   * ✅ VALIDATE VOCABULARY COUNT FOR QUIZ GENERATION
   * Cần ít nhất 4 vocabularies để tạo quiz questions (1 đúng + 3 sai)
   */
  private async getRandomQuizQuestions(
    count: number,
    difficulty: string,
    topicId?: number,
  ): Promise<QuizQuestion[]> {
    const queryBuilder = this.quizQuestionRepository
      .createQueryBuilder('qq')
      .leftJoinAndSelect('qq.vocabulary', 'vocab')
      .leftJoinAndSelect('vocab.topic', 'topic');

    if (topicId) {
      queryBuilder.andWhere('vocab.topicId = :topicId', { topicId });
    }

    if (difficulty !== 'Mixed Levels') {
      queryBuilder.andWhere('vocab.difficultyLevel = :difficulty', {
        difficulty,
      });
    }

    // ✅ CHECK: Đếm số lượng vocabularies available
    const totalVocabs = await this.vocabularyRepository.count({
      where: topicId
        ? {
            topicId,
            difficultyLevel:
              difficulty !== 'Mixed Levels' ? (difficulty as any) : undefined,
          }
        : difficulty !== 'Mixed Levels'
          ? { difficultyLevel: difficulty as any }
          : {},
    });

    // ✅ VALIDATION: Cần ít nhất 4 vocabularies
    if (totalVocabs < 4) {
      throw new BadRequestException(
        `Cannot generate quiz: Need at least 4 vocabularies, but only ${totalVocabs} available. ` +
          `Please add more vocabularies to this ${topicId ? 'topic' : 'difficulty level'}.`,
      );
    }

    queryBuilder.orderBy('RANDOM()').limit(count);

    const questions = await queryBuilder.getMany();

    if (questions.length === 0) {
      throw new BadRequestException(
        'No quiz questions found. Please ensure vocabularies have generated questions.',
      );
    }

    return questions;
  }

  async getQuizById(quizId: number, userId: number): Promise<Quiz> {
    const quiz = await this.quizRepository.findOne({
      where: { id: quizId, userId },
      relations: [
        'results',
        'results.quizQuestion',
        'results.quizQuestion.vocabulary',
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
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['results'],
    });
  }

  async submitQuiz(
    quizId: number,
    userId: number,
    dto: SubmitQuizDto,
  ): Promise<QuizResultDto> {
    const quiz = await this.quizRepository.findOne({
      where: { id: quizId, userId },
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${quizId} not found`);
    }

    const results: QuestionResult[] = [];
    let correctCount = 0;

    for (const answer of dto.answers) {
      const question = await this.quizQuestionRepository.findOne({
        where: { id: answer.questionId },
        relations: ['vocabulary'],
      });

      if (!question) {
        continue;
      }

      const isCorrect = this.checkAnswer(question.correctAnswer, answer.answer);

      if (isCorrect) {
        correctCount++;
      }

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

    const totalQuestions = dto.answers.length;
    const score = Math.round((correctCount / totalQuestions) * 100);

    quiz.score = score;
    await this.quizRepository.save(quiz);

    return {
      quizId: quiz.id,
      totalQuestions,
      correctAnswers: correctCount,
      score,
      completedAt: new Date(),
      questions: results,
    };
  }

  private checkAnswer(correctAnswer: string, userAnswer: string): boolean {
    const correct = correctAnswer.toLowerCase().trim();
    const user = userAnswer.toLowerCase().trim();
    return correct === user;
  }

  async getQuizStatistics(userId: number) {
    const quizzes = await this.quizRepository.find({
      where: { userId },
    });

    const completedQuizzes = quizzes.filter((q) => q.score > 0);
    const totalQuizzes = completedQuizzes.length;
    const totalScore = completedQuizzes.reduce(
      (sum, quiz) => sum + quiz.score,
      0,
    );
    const averageScore =
      totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0;

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

    const recentQuizzes = await this.getUserQuizzes(userId, 5);

    return {
      totalQuizzes,
      averageScore,
      totalQuestionsAnswered: totalQuestions,
      correctAnswers,
      accuracy,
      bestScore,
      recentQuizzes,
    };
  }

  async deleteQuiz(quizId: number, userId: number): Promise<void> {
    const quiz = await this.quizRepository.findOne({
      where: { id: quizId, userId },
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${quizId} not found`);
    }

    await this.quizRepository.remove(quiz);
  }
}
