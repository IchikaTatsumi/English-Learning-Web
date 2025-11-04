import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Username or email for login',
    type: String,
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  usernameOrEmail: string;

  @ApiProperty({
    description: 'User password for login',
    type: String,
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
