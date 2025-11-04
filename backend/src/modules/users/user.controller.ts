import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Role } from 'src/core/enums/role.enum';
import { Roles } from 'src/core/decorators/role.decorator';
import { UsersService } from './user.service';
import { UserDto } from './dto/user-response.dto';

// Define proper request type with user
interface RequestWithUser extends Request {
  user: {
    id: number;
    email: string;
    role: Role;
  };
}

export class CreateUserDTO {
  username: string;
  password: string;
  email: string;
  fullName: string;
}

@ApiBearerAuth()
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOkResponse({ type: [UserDto] })
  @Get()
  async getAllUsers(): Promise<UserDto[]> {
    const users = await this.usersService.getAllUsers();
    return users.map((user) => UserDto.fromEntity(user));
  }

  @ApiOkResponse({ type: UserDto })
  @Get('me')
  async getMe(@Request() req: RequestWithUser): Promise<UserDto> {
    const user = await this.usersService.getUserById(req.user.id.toString());
    return UserDto.fromEntity(user);
  }

  @Roles(Role.ADMIN)
  @ApiOkResponse({ type: UserDto })
  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<UserDto> {
    const user = await this.usersService.getUserById(id);
    return UserDto.fromEntity(user);
  }

  @Roles(Role.ADMIN)
  @ApiOkResponse({ type: UserDto })
  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<UserDto> {
    const user = await this.usersService.deleteUser(id);
    return UserDto.fromEntity(user);
  }

  @Roles(Role.ADMIN)
  @ApiOkResponse({ type: UserDto })
  @Post()
  async createUser(@Body() dto: CreateUserDTO): Promise<UserDto> {
    const user = await this.usersService.createUser(dto);
    return UserDto.fromEntity(user);
  }
}
