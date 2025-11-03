import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { QuizQuestion } from '../../quizquestions/entities/quizquestion.entity';
import type { Relation } from 'typeorm';

export enum DifficultyMode {
  BEGINNER_ONLY = 'BEGINNER_ONLY',
  INTERMEDIATE_ONLY = 'INTERMEDIATE_ONLY',
  ADVANCED_ONLY = 'ADVANCED_ONLY',
  MIXED_LEVELS = 'MIXED_LEVELS',
}

@Entity('quizzes')
export class Quiz {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({
    name: 'difficulty_mode',
    type: 'enum',
    enum: DifficultyMode,
    default: DifficultyMode.MIXED_LEVELS,
  })
  difficultyMode: DifficultyMode;

  @Column({ name: 'total_questions', default: 10 })
  totalQuestions: number;

  @Column({ default: 0 })
  score: number;

  @Column({ name: 'completed', default: false })
  completed: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @OneToMany(() => QuizQuestion, (question) => question.quiz)
  questions: Relation<QuizQuestion[]>;
}
