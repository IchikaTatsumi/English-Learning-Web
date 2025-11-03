import { AutoExpose } from 'src/core/decorators/auto-expose.decorator';
import { IsOptional, IsString } from 'class-validator';
import { Role } from 'src/core/constants/enums';
import { BaseResponseDto } from 'src/core/dto/base.dto';

@AutoExpose()
export class UserDTO extends BaseResponseDto {
  id: string;
  username: string;
  role: Role;
  createdAt: Date;
}

export class CreateUserDTO {
  username: string;
  password: string;
}

export class UpdateUserDTO {
  @IsOptional()
  @IsString()
  username: string;
}
