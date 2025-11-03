import { Exclude } from 'class-transformer';
import { Role } from 'src/core/constants/enums';
import { FileEntity } from 'src/modules/files/entities/file.entity';
import { Permission } from 'src/modules/permission/entities/permission.entity';
import type { Relation } from 'typeorm';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
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

  @OneToMany(() => FileEntity, (item) => item.owner)
  files: Relation<FileEntity[]>;

  @OneToMany(() => Permission, (perm) => perm.user)
  permissions: Relation<Permission[]>;

  @Column({ type: 'enum', enum: Role, default: Role.User })
  role: Role;
}
