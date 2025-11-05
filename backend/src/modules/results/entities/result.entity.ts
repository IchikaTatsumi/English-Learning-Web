import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Quiz } from '../../quiz/entities/quiz.entity';
import { QuizQuestion } from '../../quizquestions/entities/quizquestion.entity';
import type { Relation } from 'typeorm';

@Entity('result')
export class Result {
  @PrimaryGeneratedColumn({ name: 'result_id' })
  id: number;

  @Column({ name: 'quiz_id' })
  quizId: number;

  @Column({ name: 'quiz_question_id' })
  quizQuestionId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'user_answer', length: 255, nullable: true })
  userAnswer: string;

  @Column({ name: 'user_speech_text', type: 'text', nullable: true })
  userSpeechText: string;

  @Column({ name: 'is_correct', default: false })
  isCorrect: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Quiz, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quiz_id' })
  quiz: Relation<Quiz>;

  @ManyToOne(() => QuizQuestion, (question) => question.results, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'quiz_question_id' })
  quizQuestion: Relation<QuizQuestion>;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;
}
