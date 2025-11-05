import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Topic } from '../../topics/entities/topic.entity';
import { QuizQuestion } from '../../quizquestions/entities/quizquestion.entity';
import { DifficultyLevel } from 'src/core/enums/difficulty-level.enum';
import type { Relation } from 'typeorm';

@Entity('vocabulary')
export class Vocabulary {
  @PrimaryGeneratedColumn({ name: 'vocab_id' })
  id: number;

  @Column({ name: 'topic_id', nullable: true })
  topicId: number;

  @Column({ length: 100 })
  word: string;

  @Column({ length: 100, nullable: true })
  ipa: string;

  @Column({ name: 'meaning_en', type: 'text' })
  meaningEn: string;

  @Column({ name: 'meaning_vi', type: 'text' })
  meaningVi: string;

  @Column({ name: 'example_sentence', type: 'text', nullable: true })
  exampleSentence: string;

  @Column({ name: 'audio_path', length: 255, nullable: true })
  audioPath: string;

  // ✅ CORRECT: Use DifficultyLevel enum
  @Column({
    name: 'difficulty_level',
    type: 'enum',
    enum: DifficultyLevel, // TypeORM extracts: ['Beginner', 'Intermediate', 'Advanced']
    default: DifficultyLevel.BEGINNER,
  })
  difficultyLevel: DifficultyLevel; // TypeScript type

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Topic, (topic) => topic.vocabularies, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'topic_id' })
  topic: Relation<Topic>;

  @OneToMany(() => QuizQuestion, (question) => question.vocabulary)
  quizQuestions: Relation<QuizQuestion[]>;
}
