import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { Role } from 'src/core/enums/role.enum';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  id: number;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ name: 'full_name', length: 100 })
  fullName: string;

  @Column({ length: 255 })
  password: string;

  // ✅ CORRECT: Use enum type, TypeORM will handle conversion
  @Column({
    type: 'enum',
    enum: Role, // TypeORM uses the VALUES: ['Admin', 'User']
    default: Role.USER,
  })
  role: Role; // TypeScript type

  @Column({ name: 'avatar_url', length: 255, nullable: true })
  avatarUrl?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;
}
