import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import type { Relation } from 'typeorm';

@Entity('progress')
export class Progress {
  @PrimaryGeneratedColumn({ name: 'progress_id' })
  id: number;

  @Column({ name: 'user_id', unique: true })
  userId: number;

  @Column({ name: 'total_quizzes', default: 0 })
  totalQuizzes: number;

  @Column({ name: 'total_questions', default: 0 })
  totalQuestions: number;

  @Column({ name: 'correct_answers', default: 0 })
  correctAnswers: number;

  @Column({ name: 'accuracy_rate', type: 'float', default: 0 })
  accuracyRate: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  // Virtual fields (not in DB, calculated)
  totalWords?: number;
  correctWords?: number;
  avgScore?: number;
}
