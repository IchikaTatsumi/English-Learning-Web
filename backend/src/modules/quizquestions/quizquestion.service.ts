import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizQuestion } from './entities/quizquestion.entity';
import { Vocabulary } from '../vocabularies/entities/vocabulary.entity';
import { CreateQuizQuestionDto } from './dto/quizquestion.dto';

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

  /**
   * ✅ GENERATE QUESTIONS WITH WRONG ANSWERS
   * Cần ít nhất 4 vocabularies để tạo 1 đúng + 3 sai
   */
  async generateQuestionsForQuiz(
    quizId: number,
    vocabularies: Vocabulary[],
  ): Promise<QuizQuestion[]> {
    // ✅ VALIDATION: Check minimum vocabulary count
    if (vocabularies.length < 4) {
      throw new BadRequestException(
        `Cannot generate quiz questions: Need at least 4 vocabularies, but only ${vocabularies.length} provided. ` +
          `Add more vocabularies to generate valid multiple-choice questions.`,
      );
    }

    const questionTypes = [
      'WordToMeaning',
      'MeaningToWord',
      'VietnameseToWord',
      'Pronunciation',
    ];
    const questions: QuizQuestion[] = [];

    for (const vocab of vocabularies) {
      const questionType =
        questionTypes[Math.floor(Math.random() * questionTypes.length)];
      const questionData = this.generateQuestionData(vocab, questionType);

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

  private generateQuestionData(
    vocab: Vocabulary,
    questionType: string,
  ): { questionText: string; correctAnswer: string } {
    let questionText: string;
    let correctAnswer: string;

    switch (questionType) {
      case 'WordToMeaning':
        questionText = `What is the meaning of "${vocab.word}"?`;
        correctAnswer = vocab.meaningEn;
        break;

      case 'MeaningToWord':
        questionText = `Which word means "${vocab.meaningEn}"?`;
        correctAnswer = vocab.word;
        break;

      case 'VietnameseToWord':
        questionText = `Translate to English: "${vocab.meaningVi}"`;
        correctAnswer = vocab.word;
        break;

      case 'Pronunciation':
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
