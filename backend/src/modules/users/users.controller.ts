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
import { CreateUserDTO, UserDTO } from './dtos/user.dto';
import { UsersService } from './users.service';

@ApiBearerAuth()
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOkResponse({ type: [UserDTO] })
  @Get()
  async getAllUsers(): Promise<UserDTO[]> {
    return UserDTO.fromEntities(await this.usersService.getAllUsers());
  }

  @ApiOkResponse({ type: UserDTO })
  @Get('me')
  async getMe(@Request() req): Promise<UserDTO> {
    return UserDTO.fromEntity(await this.usersService.getUserById(req.user.id));
  }

  @Roles(Role.Admin)
  @ApiOkResponse({ type: UserDTO })
  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<UserDTO> {
    return UserDTO.fromEntity(await this.usersService.getUserById(id));
  }

  @Roles(Role.Admin)
  @ApiOkResponse({ type: UserDTO })
  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<UserDTO> {
    const user = await this.usersService.deleteUser(id);
    return UserDTO.fromEntity(user);
  }

  @Roles(Role.Admin)
  @ApiOkResponse({ type: UserDTO })
  @Post()
  async createUser(@Body() dto: CreateUserDTO): Promise<UserDTO> {
    return UserDTO.fromEntity(await this.usersService.createUser(dto));
  }
}
