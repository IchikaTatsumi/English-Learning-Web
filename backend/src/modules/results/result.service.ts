import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Result } from './entities/result.entity';
import { CreateResultDTO, QuizSubmitDTO, QuizResultDTO } from './dtos/result.dto';
import { VocabularyService } from '../vocabularies/vocabulary.service';

@Injectable()
export class ResultService {
  constructor(
    @InjectRepository(Result)
    private resultRepository: Repository<Result>,
    private vocabularyService: VocabularyService,
  ) {}

  async createResult(userId: string, dto: CreateResultDTO): Promise<Result> {
    const vocabulary = await this.vocabularyService.getVocabularyById(dto.vocabId);
    
    const result = this.resultRepository.create({
      userId,
      vocabId: dto.vocabId,
      recognizedText: dto.recognizedText,
      score: dto.score,
      audioUserPath: dto.audioUserPath,
    });

    return await this.resultRepository.save(result);
  }

  async getResultsByUserId(userId: string): Promise<Result[]> {
    return await this.resultRepository.find({
      where: { userId },
      relations: ['vocabulary'],
      order: { createdAt: 'DESC' },
    });
  }

  async getResultsByVocabId(vocabId: number, userId: string): Promise<Result[]> {
    return await this.resultRepository.find({
      where: { vocabId, userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getBestScoreForVocab(vocabId: number, userId: string): Promise<number> {
    const result = await this.resultRepository.findOne({
      where: { vocabId, userId },
      order: { score: 'DESC' },
    });
    return result ? result.score : 0;
  }

  async submitQuiz(userId: string, dto: QuizSubmitDTO): Promise<QuizResultDTO> {
    const results = [];
    let correctAnswers = 0;

    for (const answer of dto.answers) {
      const vocabulary = await this.vocabularyService.getVocabularyById(answer.vocabId);
      const isCorrect = answer.answer.toLowerCase().trim() === vocabulary.word.toLowerCase().trim();
      
      if (isCorrect) {
        correctAnswers++;
      }

      results.push({
        vocabId: vocabulary.id,
        word: vocabulary.word,
        userAnswer: answer.answer,
        correctAnswer: vocabulary.word,
        isCorrect,
      });

      // Save result
      await this.createResult(userId, {
        vocabId: answer.vocabId,
        recognizedText: answer.answer,
        score: isCorrect ? 100 : 0,
      });
    }

    return {
      totalQuestions: dto.answers.length,
      correctAnswers,
      score: Math.round((correctAnswers / dto.answers.length) * 100),
      results,
    };
  }

  async getRecentResults(userId: string, limit: number = 10): Promise<Result[]> {
    return await this.resultRepository.find({
      where: { userId },
      relations: ['vocabulary'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}