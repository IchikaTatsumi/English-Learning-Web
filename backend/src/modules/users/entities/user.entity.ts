import { Exclude } from 'class-transformer';
import { Role } from 'src/core/constants/enums';
import { FileEntity } from 'src/modules/files/entities/file.entity';
import { Permission } from 'src/modules/permission/entities/permission.entity';
import { Result } from 'src/modules/results/entities/result.entity';
import { Progress } from 'src/modules/progress/entities/progress.entity';
import type { Relation } from 'typeorm';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  passwordHash: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'enum', enum: Role, default: Role.User })
  role: Role;

  // NEW RELATIONS
  @OneToMany(() => Result, (result) => result.user)
  results: Relation<Result[]>;

  @OneToOne(() => Progress, (progress) => progress.user)
  progress: Relation<Progress>;
}
