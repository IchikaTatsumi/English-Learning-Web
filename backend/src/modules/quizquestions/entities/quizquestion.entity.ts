import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Quiz } from '../../quiz/entities/quiz.entity';
import { Vocabulary } from '../../vocabularies/entities/vocabulary.entity';
import type { Relation } from 'typeorm';

export enum QuestionType {
  WORD_TO_MEANING = 'WordToMeaning',
  MEANING_TO_WORD = 'MeaningToWord',
  VIETNAMESE_TO_WORD = 'VietnameseToWord',
  PRONUNCIATION = 'Pronunciation',
}

@Entity('quiz_questions')
export class QuizQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'quiz_id', nullable: true })
  quizId: number;

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

  @Column({ name: 'options', type: 'json', nullable: true })
  options: string[]; // For multiple choice questions

  @Column({ name: 'time_limit', default: 30 })
  timeLimit: number;

  @Column({ name: 'user_answer', nullable: true })
  userAnswer: string;

  @Column({ name: 'is_correct', nullable: true })
  isCorrect: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Quiz, (quiz) => quiz.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quiz_id' })
  quiz: Relation<Quiz>;

  @ManyToOne(() => Vocabulary, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vocab_id' })
  vocabulary: Relation<Vocabulary>;
}
