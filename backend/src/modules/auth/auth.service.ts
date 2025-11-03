import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { BcryptUtil } from 'src/core/utils/bcrypt.util';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { LoginDto, LoginResponseDto } from './dtos/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.userRepository.findOneBy({ username: loginDto.username });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isPasswordValid = await BcryptUtil.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }
    const payload = { sub: user.id, username: user.username, role: user.role };
    const token = this.jwtService.sign(payload);
    return { user, token };
  }
  
}
