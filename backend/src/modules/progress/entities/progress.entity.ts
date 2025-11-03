import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, JoinColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import type { Relation } from 'typeorm';

@Entity('progress')
export class Progress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', unique: true })
  userId: string; // foreign key to User.id

  @Column({ name: 'total_words', default: 0 })
  totalWords: number;

  @Column({ name: 'correct_words', default: 0 })
  correctWords: number;

  @Column({ name: 'avg_score', type: 'float', default: 0 })
  avgScore: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;
}