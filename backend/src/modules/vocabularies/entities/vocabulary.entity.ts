import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Lesson } from '../../lessons/entities/lesson.entity';
import { Result } from '../../results/entities/result.entity';
import type { Relation } from 'typeorm';

@Entity('vocabularies')
export class Vocabulary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'lesson_id' })
  lessonId: number;

  @Column({ length: 100 })
  word: string;

  @Column({ length: 100, nullable: true })
  ipa: string;

  @Column({ length: 255 })
  meaning: string;

  @Column({ name: 'audio_path', length: 255, nullable: true })
  audioPath: string;

  @Column({
    type: 'enum',
    enum: ['A1', 'A2', 'B1', 'B2', 'C1'],
    default: 'A1',
  })
  level: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Lesson, (lesson) => lesson.vocabularies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lesson_id' })
  lesson: Relation<Lesson>;

  @OneToMany(() => Result, (result) => result.vocabulary)
  results: Relation<Result[]>;
}