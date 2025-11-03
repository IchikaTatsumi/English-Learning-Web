import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizQuestion, QuestionType } from './entities/quizquestion.entity';
import { Vocabulary } from '../vocabularies/entities/vocabulary.entity';
import { CreateQuizQuestionDto } from './dtos/quizquestion.dto';

@Injectable()
export class QuizQuestionService {
  constructor(
    @InjectRepository(QuizQuestion)
    private quizQuestionRepository: Repository<QuizQuestion>,
    @InjectRepository(Vocabulary)
    private vocabularyRepository: Repository<Vocabulary>,
  ) {}

  async createQuestion(dto: CreateQuizQuestionDto): Promise<QuizQuestion> {
    const question = this.quizQuestionRepository.create(dto);
    return await this.quizQuestionRepository.save(question);
  }

  async getQuestionById(questionId: number): Promise<QuizQuestion> {
    const question = await this.quizQuestionRepository.findOne({
      where: { id: questionId },
      relations: ['vocabulary', 'quiz'],
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }

    return question;
  }

  async getQuestionsByQuizId(quizId: number): Promise<QuizQuestion[]> {
    return await this.quizQuestionRepository.find({
      where: { quizId },
      relations: ['vocabulary'],
      order: { id: 'ASC' },
    });
  }

  async updateQuestion(
    questionId: number,
    updateData: Partial<QuizQuestion>,
  ): Promise<QuizQuestion> {
    const question = await this.getQuestionById(questionId);
    Object.assign(question, updateData);
    return await this.quizQuestionRepository.save(question);
  }

  async generateQuestionsForQuiz(
    quizId: number,
    vocabularies: Vocabulary[],
  ): Promise<void> {
    const questionTypes = Object.values(QuestionType);

    for (const vocab of vocabularies) {
      // Randomly select question type
      const questionType =
        questionTypes[Math.floor(Math.random() * questionTypes.length)];

      const questionData = await this.generateQuestionData(vocab, questionType);

      const question = this.quizQuestionRepository.create({
        quizId,
        vocabId: vocab.id,
        questionType,
        questionText: questionData.questionText,
        correctAnswer: questionData.correctAnswer,
        options: questionData.options,
        timeLimit: 30,
      });

      await this.quizQuestionRepository.save(question);
    }
  }

  private async generateQuestionData(
    vocab: Vocabulary,
    questionType: QuestionType,
  ): Promise<{
    questionText: string;
    correctAnswer: string;
    options: string[];
  }> {
    let questionText: string;
    let correctAnswer: string;
    let options: string[] = [];

    switch (questionType) {
      case QuestionType.WORD_TO_MEANING:
        questionText = `What is the meaning of "${vocab.word}"?`;
        correctAnswer = vocab.meaning;
        options = await this.generateMeaningOptions(vocab);
        break;

      case QuestionType.MEANING_TO_WORD:
        questionText = `Which word means "${vocab.meaning}"?`;
        correctAnswer = vocab.word;
        options = await this.generateWordOptions(vocab);
        break;

      case QuestionType.VIETNAMESE_TO_WORD:
        questionText = `Translate to English: "${vocab.meaning}"`;
        correctAnswer = vocab.word;
        options = await this.generateWordOptions(vocab);
        break;

      case QuestionType.PRONUNCIATION:
        questionText = `How is "${vocab.word}" pronounced? (IPA)`;
        correctAnswer = vocab.ipa || vocab.word;
        options = await this.generateIPAOptions(vocab);
        break;

      default:
        questionText = `What is "${vocab.word}"?`;
        correctAnswer = vocab.meaning;
        options = await this.generateMeaningOptions(vocab);
    }

    return { questionText, correctAnswer, options };
  }

  private async generateMeaningOptions(vocab: Vocabulary): Promise<string[]> {
    // Get other vocabularies for wrong options
    const others = await this.vocabularyRepository
      .createQueryBuilder('vocab')
      .where('vocab.id != :id', { id: vocab.id })
      .andWhere('vocab.level = :level', { level: vocab.level })
      .orderBy('RANDOM()')
      .limit(3)
      .getMany();

    const options = [vocab.meaning, ...others.map((v) => v.meaning)];
    return this.shuffleArray(options);
  }

  private async generateWordOptions(vocab: Vocabulary): Promise<string[]> {
    const others = await this.vocabularyRepository
      .createQueryBuilder('vocab')
      .where('vocab.id != :id', { id: vocab.id })
      .andWhere('vocab.level = :level', { level: vocab.level })
      .orderBy('RANDOM()')
      .limit(3)
      .getMany();

    const options = [vocab.word, ...others.map((v) => v.word)];
    return this.shuffleArray(options);
  }

  private async generateIPAOptions(vocab: Vocabulary): Promise<string[]> {
    if (!vocab.ipa) {
      return [vocab.word];
    }

    const others = await this.vocabularyRepository
      .createQueryBuilder('vocab')
      .where('vocab.id != :id', { id: vocab.id })
      .andWhere('vocab.ipa IS NOT NULL')
      .orderBy('RANDOM()')
      .limit(3)
      .getMany();

    const options = [
      vocab.ipa,
      ...others.map((v) => v.ipa).filter((ipa) => ipa),
    ];
    return this.shuffleArray(options).slice(0, 4);
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  async deleteQuestion(questionId: number): Promise<void> {
    const question = await this.getQuestionById(questionId);
    await this.quizQuestionRepository.remove(question);
  }
}
