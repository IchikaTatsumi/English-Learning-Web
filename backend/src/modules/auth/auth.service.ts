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
import { User } from 'src/modules/users/entities/user.entity';
import { Repository } from 'typeorm';
import { UserDto } from '../users/dto/user-response.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

interface JwtPayload {
  sub: number;
  email: string;
  role: Role;
}

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async onModuleInit(): Promise<void> {
    const adminUser = await this.userRepository.findOne({
      where: { role: Role.ADMIN },
    });

    if (!adminUser) {
      this.logger.log('Creating default admin user');
      const user = this.userRepository.create({
        username: 'admin',
        fullName: 'Administrator',
        email: 'admin@gmail.com',
        password: await BcryptUtil.hash('admin123'),
        role: Role.ADMIN,
      });
      await this.userRepository.save(user);
      this.logger.log('Default admin user created successfully');
    }
  }

  async register(registerDto: RegisterDto): Promise<UserDto> {
    const { username, email, password, fullName } = registerDto;

    // Check if username already exists
    const existingUsername = await this.userRepository.findOne({
      where: { username },
    });
    if (existingUsername) {
      throw new BadRequestException('Username already exists');
    }

    // Check if email already exists
    const existingEmail = await this.userRepository.findOne({
      where: { email },
    });
    if (existingEmail) {
      throw new BadRequestException('Email already exists');
    }

    // Hash the password
    const hashedPassword = await BcryptUtil.hash(password);

    // Create new user
    const user = this.userRepository.create({
      username,
      fullName,
      email,
      password: hashedPassword,
      role: Role.USER,
    });

    const savedUser = await this.userRepository.save(user);

    return UserDto.fromEntity(savedUser);
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { usernameOrEmail, password } = loginDto;

    // Find user by username or email
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.username = :usernameOrEmail', { usernameOrEmail })
      .orWhere('user.email = :usernameOrEmail', { usernameOrEmail })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('Invalid username/email or password');
    }

    // Compare password
    const isPasswordValid = await BcryptUtil.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid username/email or password');
    }

    // Generate JWT token
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const token = this.jwtService.sign(payload);

    return {
      accessToken: token,
      user: UserDto.fromEntity(user),
    };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { token, newPassword } = resetPasswordDto;

    try {
      // Verify the reset token
      const decoded = this.jwtService.verify<JwtPayload>(token);
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
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        throw new BadRequestException('Password reset token has expired');
      }
      throw new BadRequestException('Invalid password reset token');
    }
  }
}
