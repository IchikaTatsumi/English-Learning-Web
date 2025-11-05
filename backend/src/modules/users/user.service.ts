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

  async deleteUser(id: string): Promise<User> {
    const user = await this.getUserById(id);
    await this.userRepository.remove(user);
    return user;
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
        console.log('Default admin created');
      }
    } catch (error) {
      console.error('Error creating admin:', error);
    }
  }

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: parseInt(id) },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async getUserByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { username } });
  }

  async updateUser(id: string, updateUserDto: UpdateUserDTO): Promise<User> {
    const user = await this.getUserById(id);

    if (updateUserDto.password) {
      updateUserDto.password = await BcryptUtil.hash(updateUserDto.password);
    }

    this.userRepository.merge(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async createUser(userDto: CreateUserDTO): Promise<User> {
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
  }
}
