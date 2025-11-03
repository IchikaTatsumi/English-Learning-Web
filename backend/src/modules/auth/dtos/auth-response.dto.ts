import { AutoExpose } from 'src/core/decorators/auto-expose.decorator';
import { BaseResponseDto } from 'src/core/dto/base.dto';
import { UserResponseDto } from 'src/modules/user/dto/user-response.dto';

@AutoExpose()
export class AuthResponseDto extends BaseResponseDto {
  accessToken: string;
  user: UserResponseDto;
}
