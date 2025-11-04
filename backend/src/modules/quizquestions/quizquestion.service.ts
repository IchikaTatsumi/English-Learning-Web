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
      relations: ['vocabulary', 'vocabulary.topic'],
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }

    return question;
  }

  async getQuestionsByQuizId(quizId: number): Promise<QuizQuestion[]> {
    // Note: Based on DB schema, quiz_question doesn't have quiz_id
    // We need to get questions through results or restructure
    return await this.quizQuestionRepository.find({
      relations: ['vocabulary', 'vocabulary.topic'],
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
  ): Promise<QuizQuestion[]> {
    const questionTypes = Object.values(QuestionType);
    const questions: QuizQuestion[] = [];

    for (const vocab of vocabularies) {
      // Randomly select question type
      const questionType =
        questionTypes[Math.floor(Math.random() * questionTypes.length)];

      const questionData = await this.generateQuestionData(vocab, questionType);

      const question = this.quizQuestionRepository.create({
        vocabId: vocab.id,
        questionType,
        questionText: questionData.questionText,
        correctAnswer: questionData.correctAnswer,
        timeLimit: 30,
      });

      const savedQuestion = await this.quizQuestionRepository.save(question);
      questions.push(savedQuestion);
    }

    return questions;
  }

  private async generateQuestionData(
    vocab: Vocabulary,
    questionType: QuestionType,
  ): Promise<{
    questionText: string;
    correctAnswer: string;
  }> {
    let questionText: string;
    let correctAnswer: string;

    switch (questionType) {
      case QuestionType.WORD_TO_MEANING:
        questionText = `What is the meaning of "${vocab.word}"?`;
        correctAnswer = vocab.meaningEn;
        break;

      case QuestionType.MEANING_TO_WORD:
        questionText = `Which word means "${vocab.meaningEn}"?`;
        correctAnswer = vocab.word;
        break;

      case QuestionType.VIETNAMESE_TO_WORD:
        questionText = `Translate to English: "${vocab.meaningVi}"`;
        correctAnswer = vocab.word;
        break;

      case QuestionType.PRONUNCIATION:
        questionText = `How is "${vocab.word}" pronounced? (IPA)`;
        correctAnswer = vocab.ipa || vocab.word;
        break;

      default:
        questionText = `What is "${vocab.word}"?`;
        correctAnswer = vocab.meaningEn;
    }

    return { questionText, correctAnswer };
  }

  async getRandomQuestions(count: number = 10): Promise<QuizQuestion[]> {
    return await this.quizQuestionRepository
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.vocabulary', 'vocab')
      .leftJoinAndSelect('vocab.topic', 'topic')
      .orderBy('RANDOM()')
      .limit(count)
      .getMany();
  }

  async deleteQuestion(questionId: number): Promise<void> {
    const question = await this.getQuestionById(questionId);
    await this.quizQuestionRepository.remove(question);
  }
}
