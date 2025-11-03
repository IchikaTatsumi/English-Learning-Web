import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { Public } from 'src/core/decorators/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto } from './dtos/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    const { user, token } = await this.authService.login(loginDto);
    return { user, token };
  }
}
