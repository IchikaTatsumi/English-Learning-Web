import { AutoExpose } from 'src/core/decorators/auto-expose.decorator';
import { BaseResponseDto } from 'src/core/dto/base.dto';
import { UserDto } from 'src/modules/users/dto/user-response.dto';

@AutoExpose()
export class AuthResponseDto extends BaseResponseDto {
  accessToken: string;
  user: UserDto;
}
