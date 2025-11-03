import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/core/enums/role.enum';
import { BcryptUtil } from 'src/core/utils/bcrypt.util';
import { User } from 'src/modules/user/entities/user.entity';
import { Repository } from 'typeorm';
import { UserResponseDto } from '../user/dto/user-response.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async onModuleInit() {
    const adminUser = await this.userRepository.findOne({
      where: { role: Role.ADMIN },
    });
    if (!adminUser) {
      Logger.log('Creating admin user');
      const user = this.userRepository.create({
        fullName: 'admin',
        email: 'admin@gmail.com',
        password: await BcryptUtil.hash('admin'),
        phoneNumber: '0123456789',
        role: Role.ADMIN,
      });
      await this.userRepository.save(user);
    }
  }

  async register(registerDto: RegisterDto): Promise<UserResponseDto> {
    const { fullName, email, password, phoneNumber } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash the password
    const hashedPassword = await BcryptUtil.hash(password);

    // Create new user
    const user = this.userRepository.create({
      fullName,
      email,
      password: hashedPassword,
      phoneNumber,
      role: Role.USER,
    });

    await this.userRepository.save(user);

    return UserResponseDto.fromEntity(user);
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Compare password
    const isPasswordValid = await BcryptUtil.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate JWT token
    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      accessToken: token,
      user: UserResponseDto.fromEntity(user),
    };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { token, newPassword } = resetPasswordDto;

    try {
      // Verify the reset token
      const decoded = this.jwtService.verify(token);
      const userId = decoded.sub;

      // Find user by ID
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Hash the new password
      const hashedPassword = await BcryptUtil.hash(newPassword);

      // Update the user's password
      user.password = hashedPassword;
      await this.userRepository.save(user);

      return { message: 'Password reset successfully' };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new BadRequestException('Password reset token has expired');
      }
      throw new BadRequestException('Invalid password reset token');
    }
  }
}
