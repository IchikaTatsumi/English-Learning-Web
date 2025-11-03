import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Vocabulary } from '../../vocabularies/entities/vocabulary.entity';
import type { Relation } from 'typeorm';

@Entity('results')
export class Result {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'vocab_id' })
  vocabId: number;

  @Column({ name: 'recognized_text', length: 255 })
  recognizedText: string;

  @Column({ type: 'float', default: 0 })
  score: number;

  @Column({ name: 'attempt_count', default: 1 })
  attemptCount: number;

  @Column({ name: 'audio_user_path', length: 255, nullable: true })
  audioUserPath: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.results, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @ManyToOne(() => Vocabulary, (vocabulary) => vocabulary.results, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'vocab_id' })
  vocabulary: Relation<Vocabulary>;
}
