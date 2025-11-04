import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';
import { Role } from 'src/core/enums/role.enum';

export class UserDto {
  @ApiProperty({ example: 1, description: 'User ID' })
  id: number;

  @ApiProperty({ example: 'john_doe', description: 'Username' })
  username: string;

  @ApiProperty({ example: 'John Doe', description: 'Full name' })
  fullName: string;

  @ApiProperty({ example: 'john@example.com', description: 'Email address' })
  email: string;

  @ApiProperty({
    enum: Role,
    example: Role.USER,
    description: 'User role',
  })
  role: Role;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'Avatar URL',
    required: false,
    nullable: true,
  })
  avatarUrl?: string;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Account creation date',
  })
  createdAt: Date;

  /**
   * Transform single User entity to UserDto
   */
  static fromEntity(user: User): UserDto {
    const dto = new UserDto();
    dto.id = user.id;
    dto.username = user.username;
    dto.fullName = user.fullName;
    dto.email = user.email;
    dto.role = user.role;
    dto.avatarUrl = user.avatarUrl;
    dto.createdAt = user.createdAt;
    return dto;
  }

  /**
   * Transform array of User entities to array of UserDto
   */
  static fromEntities(users: User[]): UserDto[] {
    return users.map((user) => this.fromEntity(user));
  }
}
