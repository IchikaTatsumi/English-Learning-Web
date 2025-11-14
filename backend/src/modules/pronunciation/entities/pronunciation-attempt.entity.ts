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

@Entity('pronunciation_attempt')
export class PronunciationAttempt {
  @PrimaryGeneratedColumn({ name: 'attempt_id' })
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'vocab_id' })
  vocabId: number;

  @Column({ name: 'recognized_text', length: 255 })
  recognizedText: string;

  @Column({ name: 'target_word', length: 255 })
  targetWord: string;

  @Column({ name: 'is_correct', default: false })
  isCorrect: boolean;

  @Column({ name: 'confidence', type: 'float', default: 0 })
  confidence: number;

  @Column({ name: 'accuracy', type: 'float', default: 0 })
  accuracy: number;

  @Column({ name: 'pronunciation_score', type: 'jsonb', nullable: true })
  pronunciationScore: {
    accuracy: number;
    fluency: number;
    completeness: number;
  };

  @Column({ name: 'audio_url', length: 500, nullable: true })
  audioUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @ManyToOne(() => Vocabulary, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vocab_id' })
  vocabulary: Relation<Vocabulary>;
}
