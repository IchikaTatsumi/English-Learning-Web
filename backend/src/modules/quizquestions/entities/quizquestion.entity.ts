import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Quiz } from '../../quiz/entities/quiz.entity';
import { Vocabulary } from '../../vocabularies/entities/vocabulary.entity';
import { Result } from '../../results/entities/result.entity';
import type { Relation } from 'typeorm';

export enum QuestionType {
  WORD_TO_MEANING = 'WordToMeaning',
  MEANING_TO_WORD = 'MeaningToWord',
  VIETNAMESE_TO_WORD = 'VietnameseToWord',
  PRONUNCIATION = 'Pronunciation',
}

@Entity('quiz_question')
export class QuizQuestion {
  @PrimaryGeneratedColumn({ name: 'quiz_question_id' })
  id: number;

  @Column({ name: 'vocab_id' })
  vocabId: number;

  @Column({
    name: 'question_type',
    type: 'enum',
    enum: QuestionType,
  })
  questionType: QuestionType;

  @Column({ name: 'question_text', type: 'text' })
  questionText: string;

  @Column({ name: 'correct_answer', length: 255 })
  correctAnswer: string;

  @Column({ name: 'time_limit', default: 30 })
  timeLimit: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Vocabulary, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vocab_id' })
  vocabulary: Relation<Vocabulary>;

  @OneToMany(() => Result, (result) => result.quizQuestion)
  results: Relation<Result[]>;
}
