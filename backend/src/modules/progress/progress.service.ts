import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Progress } from './entities/progress.entity';
import { Result } from '../results/entities/result.entity';
import { ProgressStatsDTO } from './dtos/progress.dto';
import { Topic } from '../topics/entities/topic.entity'; // NEW Import
import { Vocabulary } from '../vocabularies/entities/vocabulary.entity'; // NEW Import

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(Progress)
    private progressRepository: Repository<Progress>,
    @InjectRepository(Result)
    private resultRepository: Repository<Result>,
    @InjectRepository(Topic) 
    private topicRepository: Repository<Topic>,
    @InjectRepository(Vocabulary) 
    private vocabularyRepository: Repository<Vocabulary>,
  ) {}

  async getOrCreateProgress(userId: string): Promise<Progress> {
    let progress = await this.progressRepository.findOne({
      where: { userId },
    });

    if (!progress) {
      progress = this.progressRepository.create({ userId });
      progress = await this.progressRepository.save(progress);
    }

    return progress;
  }

  // ... (updateProgress giữ nguyên logic tính toán total/correct words)

  async getProgressStats(userId: string): Promise<ProgressStatsDTO> {
    // ... (logic tính toán cho getProgressStats)

    // Tính Topic Progress (Đã sửa lỗi logic)
    const topics = await this.topicRepository.find({
        relations: ['lessons', 'lessons.vocabularies']
    });
    
    const topicProgress = await Promise.all(
        topics.map(async (topic) => {
            // ... (logic tính toán topicProgress)
            const vocabIdsInTopic = topic.lessons.flatMap(
                (lesson) => lesson.vocabularies.map(v => v.id)
            );
            const totalWords = vocabIdsInTopic.length;

            const learnedVocabIds = await this.resultRepository
                .createQueryBuilder('result')
                .select('result.vocabId')
                .addSelect('MAX(result.score)', 'maxScore')
                .where('result.userId = :userId', { userId })
                .andWhere('result.vocabId IN (:...vocabIds)', { vocabIds: vocabIdsInTopic.length > 0 ? vocabIdsInTopic : [0] })
                .groupBy('result.vocabId')
                .having('MAX(result.score) >= 80')
                .getRawMany();

            const learnedWords = learnedVocabIds.length;
            
            const topicResults = results.filter(r => 
                vocabIdsInTopic.includes(r.vocabId)
            );
            const accuracy = topicResults.length > 0 ? 
                topicResults.reduce((sum, r) => sum + r.score, 0) / topicResults.length : 0;

            return {
                topicId: topic.id,
                topicName: topic.topicName,
                totalWords,
                learnedWords,
                accuracy: Math.round(accuracy),
            };
        })
    );

    const weeklyGoal = 15; 
    const thisWeekWords = weeklyActivity.reduce((sum, day) => sum + day.count, 0); 

    return {
      totalWords: progress.totalWords,
      learnedWords: progress.correctWords,
      currentStreak,
      quizScore: Math.round(progress.avgScore),
      overallProgress: Math.round((progress.correctWords / Math.max(progress.totalWords, 1)) * 100),
      weeklyGoalProgress: Math.min(Math.round((thisWeekWords / weeklyGoal) * 100), 100),
      longestStreak,
      totalQuizzes: results.length,
      weeklyActivity: weeklyActivity.map(a => ({ day: a.day, count: a.count })),
      learningTrends: await this.getLearningTrends(userId),
      topicProgress, 
    };
  }
  // ... (các hàm calculateStreak, calculateLongestStreak, getWeeklyActivity, getLearningTrends giữ nguyên)
}