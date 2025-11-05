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
import { Result } from '../../results/entities/result.entity';
import type { Relation } from 'typeorm';

// Define QuizMode enum
export enum QuizMode {
  BEGINNER_ONLY = 'Beginner Only',
  INTERMEDIATE_ONLY = 'Intermediate Only',
  ADVANCED_ONLY = 'Advanced Only',
  MIXED_LEVELS = 'Mixed Levels',
}

@Entity('quiz')
export class Quiz {
  @PrimaryGeneratedColumn({ name: 'quiz_id' })
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  // ✅ CORRECT: Use QuizMode enum
  @Column({
    name: 'difficulty_mode',
    type: 'enum',
    enum: QuizMode,
    default: QuizMode.MIXED_LEVELS,
  })
  difficultyMode: QuizMode;

  @Column({ name: 'total_questions', default: 10 })
  totalQuestions: number;

  @Column({ default: 0 })
  score: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @OneToMany(() => Result, (result) => result.quiz)
  results: Relation<Result[]>;
}
