import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizQuestion } from './entities/quizquestion.entity';
import { CreateQuizQuestionDto } from './dto/quizquestion.dto';

@Injectable()
export class QuizQuestionService {
  constructor(
    @InjectRepository(QuizQuestion)
    private quizQuestionRepository: Repository<QuizQuestion>,
  ) {}

  async createQuestion(dto: CreateQuizQuestionDto): Promise<QuizQuestion> {
    const question = this.quizQuestionRepository.create(dto);
    return await this.quizQuestionRepository.save(question);
  }

  async findQuestionsByVocabId(vocabId: number): Promise<QuizQuestion[]> {
    return await this.quizQuestionRepository.find({
      where: { vocabId },
      relations: ['vocabulary'],
    });
  }

  async getQuestionById(id: number): Promise<QuizQuestion | null> {
    return await this.quizQuestionRepository.findOne({ where: { id } });
  }

  async deleteQuestion(id: number): Promise<void> {
    await this.quizQuestionRepository.delete(id);
  }

  async getRandomQuestions(count: number): Promise<QuizQuestion[]> {
    return await this.quizQuestionRepository
      .createQueryBuilder('question')
      .orderBy('RANDOM()')
      .limit(count)
      .getMany();
  }
}
