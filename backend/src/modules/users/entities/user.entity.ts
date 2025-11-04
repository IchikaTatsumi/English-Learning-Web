import { Exclude } from 'class-transformer';
import { Role } from 'src/core/enums/role.enum';
import { Result } from 'src/modules/results/entities/result.entity';
import { Progress } from 'src/modules/progress/entities/progress.entity';
import { Quiz } from 'src/modules/quiz/entities/quiz.entity';
import type { Relation } from 'typeorm';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  id: number;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ name: 'full_name', length: 100 })
  fullName: string;

  @Column({ length: 255 })
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @Column({ name: 'avatar_url', length: 255, nullable: true })
  avatarUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Result, (result) => result.user)
  results: Relation<Result[]>;

  @OneToMany(() => Quiz, (quiz) => quiz.user)
  quizzes: Relation<Quiz[]>;

  @OneToOne(() => Progress, (progress) => progress.user)
  progress: Relation<Progress>;
}
