import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quiz } from './entities/quiz.entity';
import { Vocabulary } from '../vocabularies/entities/vocabulary.entity';
import { Result } from '../results/entities/result.entity';
import { CreateQuizDto, SubmitQuizDto, QuizResultDto } from './dto/quiz.dto';
import { QuizQuestionService } from '../quizquestions/quizquestion.service';

// ✅ FIX: Thêm interface cho question result
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
    private quizQuestionService: QuizQuestionService,
  ) {}

  async createQuiz(userId: number, dto: CreateQuizDto): Promise<Quiz> {
    // Map difficulty to quiz mode
    const difficultyModeMap: Record<string, string> = {
      Beginner: 'Beginner Only',
      Intermediate: 'Intermediate Only',
      Advanced: 'Advanced Only',
      'Mixed Levels': 'Mixed Levels',
    };

    const quiz = this.quizRepository.create({
      userId,
      difficultyMode: difficultyModeMap[dto.difficultyLevel] as any, // Cast để tránh lỗi enum
      totalQuestions: dto.totalQuestions || 10,
      score: 0,
    });

    const savedQuiz = await this.quizRepository.save(quiz);

    // Get vocabularies based on difficulty and topic
    const vocabularies = await this.getVocabulariesForQuiz(
      dto.difficultyLevel,
      dto.totalQuestions || 10,
      dto.topicId,
    );

    if (vocabularies.length === 0) {
      throw new BadRequestException('No vocabularies available for this quiz');
    }

    // Create questions for the quiz
    await this.quizQuestionService.generateQuestionsForQuiz(
      savedQuiz.id,
      vocabularies,
    );

    return await this.getQuizById(savedQuiz.id, userId);
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

    const results: QuestionResult[] = []; // ✅ FIX: Thêm type annotation
    let correctCount = 0;

    for (const answer of dto.answers) {
      const question = await this.quizQuestionService.getQuestionById(
        answer.questionId,
      );

      if (!question) {
        continue;
      }

      const isCorrect = this.checkAnswer(question.correctAnswer, answer.answer);

      if (isCorrect) {
        correctCount++;
      }

      // Save result
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
    const totalQuestions = dto.answers.length;
    const score = Math.round((correctCount / totalQuestions) * 100);

    // Update quiz score
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

  private async getVocabulariesForQuiz(
    difficulty: string,
    count: number,
    topicId?: number,
  ): Promise<Vocabulary[]> {
    const queryBuilder = this.vocabularyRepository
      .createQueryBuilder('vocab')
      .leftJoinAndSelect('vocab.topic', 'topic');

    if (topicId) {
      queryBuilder.andWhere('vocab.topicId = :topicId', { topicId });
    }

    if (difficulty !== 'Mixed Levels') {
      queryBuilder.andWhere('vocab.difficultyLevel = :difficulty', {
        difficulty,
      });
    }

    queryBuilder.orderBy('RANDOM()').limit(count);

    return await queryBuilder.getMany();
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
