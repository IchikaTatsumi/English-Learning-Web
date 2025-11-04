import { AutoExpose } from 'src/core/decorators/auto-expose.decorator';
import { IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from 'src/core/enums/role.enum';
import { BaseResponseDto } from 'src/core/dto/base.dto';
import { ApiProperty } from '@nestjs/swagger';

@AutoExpose()
export class UserDto extends BaseResponseDto {
  id: number;
  username: string;
  fullName: string;
  role: Role;
  avatarUrl: string;
  createdAt: Date;
}

export class CreateUserDTO {
  @ApiProperty({ description: 'Username', example: 'john_doe' })
  @IsString()
  username: string;

  @ApiProperty({ description: 'Full name', example: 'John Doe' })
  @IsString()
  fullName: string;

  @ApiProperty({
    description: 'Password (min 6 characters)',
    example: 'password123',
  })
  @IsString()
  @MinLength(6)
  password: string;
}

export class UpdateUserDTO {
  @ApiProperty({ description: 'Username', required: false })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ description: 'Full name', required: false })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ description: 'Avatar URL', required: false })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
