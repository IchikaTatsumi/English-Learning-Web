import { PermissionLevel } from 'src/core/constants/enums';
import { FileEntity } from 'src/modules/files/entities/file.entity';
import { User } from 'src/modules/users/entities/user.entity';
import type { Relation } from 'typeorm';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('permission')
@Index(['user', 'file', 'permissionLevel'], { unique: true })
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.permissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @ManyToOne(() => FileEntity, (file) => file.permissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'file_id' })
  file: Relation<FileEntity>;

  @Column({
    type: 'enum',
    enum: PermissionLevel,
    default: PermissionLevel.VIEW,
  })
  permissionLevel: PermissionLevel;

  @CreateDateColumn()
  createdAt: Date;
}
