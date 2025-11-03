import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quiz, DifficultyMode } from './entities/quiz.entity';
import { QuizQuestion } from '../quizquestions/entities/quizquestion.entity';
import { Vocabulary } from '../vocabularies/entities/vocabulary.entity';
import { CreateQuizDto, SubmitQuizDto, QuizResultDto } from './dtos/quiz.dto';
import { QuizQuestionService } from '../quizquestions/quizquestion.service';

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,
    @InjectRepository(Vocabulary)
    private vocabularyRepository: Repository<Vocabulary>,
    private quizQuestionService: QuizQuestionService,
  ) {}

  async createQuiz(userId: string, dto: CreateQuizDto): Promise<Quiz> {
    // Create quiz entity
    const quiz = this.quizRepository.create({
      userId,
      difficultyMode: dto.difficultyMode,
      totalQuestions: dto.totalQuestions || 10,
      completed: false,
      score: 0,
    });

    const savedQuiz = await this.quizRepository.save(quiz);

    // Generate questions based on difficulty and filters
    const vocabularies = await this.getVocabulariesForQuiz(
      dto.difficultyMode,
      dto.totalQuestions || 10,
      dto.topicId,
      dto.lessonId,
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

  async getQuizById(quizId: number, userId: string): Promise<Quiz> {
    const quiz = await this.quizRepository.findOne({
      where: { id: quizId, userId },
      relations: ['questions', 'questions.vocabulary'],
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${quizId} not found`);
    }

    return quiz;
  }

  async getUserQuizzes(userId: string, limit = 20): Promise<Quiz[]> {
    return await this.quizRepository.find({
      where: { userId },
      relations: ['questions'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async submitQuiz(
    quizId: number,
    userId: string,
    dto: SubmitQuizDto,
  ): Promise<QuizResultDto> {
    const quiz = await this.getQuizById(quizId, userId);

    if (quiz.completed) {
      throw new BadRequestException('Quiz already completed');
    }

    const questions = quiz.questions;
    const results = [];
    let correctCount = 0;

    // Process each answer
    for (const answer of dto.answers) {
      const question = questions.find((q) => q.id === answer.questionId);

      if (!question) {
        continue;
      }

      const isCorrect = this.checkAnswer(question, answer.userAnswer);

      if (isCorrect) {
        correctCount++;
      }

      // Update question with user answer
      question.userAnswer = answer.userAnswer;
      question.isCorrect = isCorrect;
      await this.quizQuestionService.updateQuestion(question.id, {
        userAnswer: answer.userAnswer,
        isCorrect,
      });

      results.push({
        questionId: question.id,
        questionText: question.questionText,
        userAnswer: answer.userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        vocabId: question.vocabId,
        word: question.vocabulary.word,
      });
    }

    // Calculate score
    const score = Math.round((correctCount / questions.length) * 100);

    // Update quiz
    quiz.score = score;
    quiz.completed = true;
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

  private checkAnswer(question: QuizQuestion, userAnswer: string): boolean {
    const correct = question.correctAnswer.toLowerCase().trim();
    const user = userAnswer.toLowerCase().trim();

    // Exact match
    if (correct === user) {
      return true;
    }

    // Fuzzy match (allow minor typos)
    const similarity = this.calculateSimilarity(correct, user);
    return similarity >= 0.8;
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
    difficultyMode: DifficultyMode,
    count: number,
    topicId?: number,
    lessonId?: number,
  ): Promise<Vocabulary[]> {
    const queryBuilder = this.vocabularyRepository
      .createQueryBuilder('vocab')
      .leftJoinAndSelect('vocab.lesson', 'lesson')
      .leftJoinAndSelect('lesson.topic', 'topic');

    // Filter by topic or lesson
    if (lessonId) {
      queryBuilder.andWhere('vocab.lessonId = :lessonId', { lessonId });
    } else if (topicId) {
      queryBuilder.andWhere('lesson.topicId = :topicId', { topicId });
    }

    // Filter by difficulty
    if (difficultyMode !== DifficultyMode.MIXED_LEVELS) {
      const levelMap = {
        [DifficultyMode.BEGINNER_ONLY]: ['A1', 'A2'],
        [DifficultyMode.INTERMEDIATE_ONLY]: ['B1', 'B2'],
        [DifficultyMode.ADVANCED_ONLY]: ['C1', 'C2'],
      };

      const levels = levelMap[difficultyMode];
      if (levels) {
        queryBuilder.andWhere('vocab.level IN (:...levels)', { levels });
      }
    }

    // Random order and limit
    queryBuilder.orderBy('RANDOM()').limit(count);

    return await queryBuilder.getMany();
  }

  async getQuizStatistics(userId: string) {
    const quizzes = await this.quizRepository.find({
      where: { userId, completed: true },
      relations: ['questions'],
    });

    const totalQuizzes = quizzes.length;
    const totalScore = quizzes.reduce((sum, quiz) => sum + quiz.score, 0);
    const averageScore =
      totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0;

    const totalQuestions = quizzes.reduce(
      (sum, quiz) => sum + quiz.questions.length,
      0,
    );
    const correctAnswers = quizzes.reduce(
      (sum, quiz) => sum + quiz.questions.filter((q) => q.isCorrect).length,
      0,
    );

    const accuracy =
      totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0;
    const bestScore =
      quizzes.length > 0 ? Math.max(...quizzes.map((q) => q.score)) : 0;

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

  async deleteQuiz(quizId: number, userId: string): Promise<void> {
    const quiz = await this.getQuizById(quizId, userId);
    await this.quizRepository.remove(quiz);
  }
}
