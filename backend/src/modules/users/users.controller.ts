import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
  ApiOperation,
} from '@nestjs/swagger';
import { Role } from 'src/core/enums/role.enum';
import { Roles } from 'src/core/decorators/role.decorator';
import { CreateUserDTO, UpdateUserDTO, UserDTO } from './dto/user-response.dto';
import { UsersService } from './users.service';

@ApiBearerAuth()
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse({ type: UserDTO })
  async getMe(@Request() req): Promise<UserDTO> {
    const user = await this.usersService.getUserById(req.user.id);
    return UserDTO.fromEntity(user);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiOkResponse({ type: UserDTO })
  async updateMe(@Request() req, @Body() dto: UpdateUserDTO): Promise<UserDTO> {
    const user = await this.usersService.updateUser(
      req.user.id.toString(),
      dto,
    );
    return UserDTO.fromEntity(user);
  }

  @Roles(Role.ADMIN)
  @Get()
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiOkResponse({ type: [UserDTO] })
  async getAllUsers(): Promise<UserDTO[]> {
    const users = await this.usersService.getAllUsers();
    return UserDTO.fromEntities(users);
  }

  @Roles(Role.ADMIN)
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  @ApiOkResponse({ type: UserDTO })
  async getUserById(@Param('id', ParseIntPipe) id: number): Promise<UserDTO> {
    const user = await this.usersService.getUserById(id);
    return UserDTO.fromEntity(user);
  }

  @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create new user (Admin only)' })
  @ApiOkResponse({ type: UserDTO })
  async createUser(@Body() dto: CreateUserDTO): Promise<UserDTO> {
    const user = await this.usersService.createUser(dto);
    return UserDTO.fromEntity(user);
  }

  @Roles(Role.ADMIN)
  @Put(':id')
  @ApiOperation({ summary: 'Update user (Admin only)' })
  @ApiOkResponse({ type: UserDTO })
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDTO,
  ): Promise<UserDTO> {
    const user = await this.usersService.updateUser(id.toString(), dto);
    return UserDTO.fromEntity(user);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  async deleteUser(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.usersService.deleteUser(id.toString());
  }
}
