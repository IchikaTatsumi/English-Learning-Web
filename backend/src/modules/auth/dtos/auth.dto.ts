import { User } from 'src/modules/users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty()
  username: string;
  @ApiProperty()
  password: string;
}

export class RegisterDto {
  username: string;
  password: string;
}

export class LoginResponseDto {
  user: User;
  token: string;
}
