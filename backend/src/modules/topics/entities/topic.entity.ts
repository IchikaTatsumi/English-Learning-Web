import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Lesson } from '../../lessons/entities/lesson.entity';
import type { Relation } from 'typeorm';

@Entity('topics')
export class Topic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'topic_name', length: 100 })
  topicName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Lesson, (lesson) => lesson.topic)
  lessons: Relation<Lesson[]>;
}