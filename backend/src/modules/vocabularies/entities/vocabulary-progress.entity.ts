import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Vocabulary } from './vocabulary.entity';
import type { Relation } from 'typeorm';

@Entity('vocabulary_progress')
@Unique(['userId', 'vocabId'])
export class VocabularyProgress {
  @PrimaryGeneratedColumn({ name: 'vocab_progress_id' })
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'vocab_id' })
  vocabId: number;

  @Column({ name: 'is_learned', default: false })
  isLearned: boolean;

  @Column({ name: 'is_bookmarked', default: false })
  isBookmarked: boolean;

  @Column({
    name: 'last_reviewed_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  lastReviewedAt: Date;

  @Column({ name: 'practice_attempts', default: 0 })
  practiceAttempts: number;

  @Column({ name: 'practice_correct_count', default: 0 })
  practiceCorrectCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @ManyToOne(() => Vocabulary, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vocab_id' })
  vocabulary: Relation<Vocabulary>;
}
