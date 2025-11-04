import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/core/enums/role.enum';
import { BcryptUtil } from 'src/core/utils/bcrypt.util';
import { Repository } from 'typeorm';
import { CreateUserDTO, UpdateUserDTO } from './dto/user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async deleteUser(id: number): Promise<User> {
    const user = await this.getUserById(id);
    await this.userRepository.remove(user);
    return user;
  }

  async getAdmin(): Promise<User> {
    const admin = await this.userRepository.findOne({
      where: { role: Role.ADMIN },
    });
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }
    return admin;
  }

  async onModuleInit() {
    try {
      const admin = await this.userRepository.findOne({
        where: { role: Role.ADMIN },
      });

      if (!admin) {
        const password = await BcryptUtil.hash('admin');
        const newAdmin = this.userRepository.create({
          username: 'admin',
          password: password,
          fullName: 'Administrator',
          email: 'admin@example.com',
          role: Role.ADMIN,
        });
        await this.userRepository.save(newAdmin);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error creating admin:', error.message);
      }
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      return await this.userRepository.find();
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(
          `Failed to fetch users: ${error.message}`,
        );
      }
      throw new BadRequestException('Failed to fetch users');
    }
  }

  async getUserById(id: number): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof Error) {
        throw new BadRequestException(`Failed to find user: ${error.message}`);
      }
      throw new BadRequestException('Failed to find user');
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({ where: { email } });
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(
          `Failed to find user by email: ${error.message}`,
        );
      }
      throw new BadRequestException('Failed to find user by email');
    }
  }

  async getUserByUsername(username: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({ where: { username } });
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(
          `Failed to find user by username: ${error.message}`,
        );
      }
      throw new BadRequestException('Failed to find user by username');
    }
  }

  async updateUser(id: number, updateUserDto: UpdateUserDTO): Promise<User> {
    try {
      const user = await this.getUserById(id);

      if (updateUserDto.password) {
        updateUserDto.password = await BcryptUtil.hash(updateUserDto.password);
      }

      this.userRepository.merge(user, updateUserDto);
      const updatedUser = await this.userRepository.save(user);
      return updatedUser;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof Error) {
        throw new BadRequestException(
          `Failed to update user: ${error.message}`,
        );
      }
      throw new BadRequestException('Failed to update user');
    }
  }

  async createUser(userDto: CreateUserDTO): Promise<User> {
    try {
      const existingUser = await this.userRepository.findOne({
        where: { username: userDto.username },
      });

      if (existingUser) {
        throw new BadRequestException('Username already exists');
      }

      const existingEmail = await this.userRepository.findOne({
        where: { email: userDto.email },
      });

      if (existingEmail) {
        throw new BadRequestException('Email already exists');
      }

      const hashedPassword = await BcryptUtil.hash(userDto.password);

      const user = this.userRepository.create({
        username: userDto.username,
        password: hashedPassword,
        fullName: userDto.fullName,
        email: userDto.email,
        role: userDto.role || Role.USER,
        avatarUrl: userDto.avatarUrl,
      });

      return await this.userRepository.save(user);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error instanceof Error) {
        throw new BadRequestException(
          `Failed to create user: ${error.message}`,
        );
      }
      throw new BadRequestException('Failed to create user');
    }
  }
}
