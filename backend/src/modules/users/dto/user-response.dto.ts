import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';
import { Role } from 'src/core/enums/role.enum';

export class UserDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  username: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  role: Role;

  @ApiProperty({ required: false })
  avatarUrl?: string;

  @ApiProperty()
  createdAt: Date;

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
}
