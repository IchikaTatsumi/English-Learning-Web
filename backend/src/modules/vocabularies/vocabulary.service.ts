import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vocabulary } from './entities/vocabulary.entity';
import { CreateVocabularyDTO, UpdateVocabularyDTO } from './dtos/vocabulary.dto';
import { Result } from '../results/entities/result.entity';
// NEW IMPORTS
import { Lesson } from '../lessons/entities/lesson.entity';
import { Topic } from '../topics/entities/topic.entity';

@Injectable()
export class VocabularyService {
  constructor(
    @InjectRepository(Vocabulary)
    private vocabularyRepository: Repository<Vocabulary>,
    @InjectRepository(Result)
    private resultRepository: Repository<Result>,
  ) {}
// ... (getAllVocabularies, getVocabulariesByLessonId, getVocabularyById, createVocabulary, updateVocabulary, deleteVocabulary, searchVocabularies, getRandomVocabulariesForQuiz giữ nguyên)

  async getVocabulariesWithProgress(userId: string, lessonId?: number): Promise<any[]> {
    const where = lessonId ? { lessonId } : {};
    const vocabularies = await this.vocabularyRepository.find({
      where,
      relations: ['lesson', 'lesson.topic'], // Add relations to get topic info
    });

    const vocabulariesWithProgress = await Promise.all(
      vocabularies.map(async (vocab) => {
        const results = await this.resultRepository.find({
          where: { 
            vocabId: vocab.id,
            userId 
          },
          order: { score: 'DESC' },
        });

        const bestScore = results.length > 0 ? results[0].score : 0;
        const isLearned = bestScore >= 80;
        const lastReviewed = results.length > 0 ? results[0].createdAt : null;

        return {
          ...vocab,
          isLearned,
          bestScore,
          lastReviewed,
          topicId: vocab.lesson.topic.id // Export topicId for front-end
        };
      })
    );

    return vocabulariesWithProgress;
  }
}