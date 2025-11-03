import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PermissionLevel, Role } from 'src/core/constants/enums';
import { Repository } from 'typeorm';
import { FileService } from '../files/file.service';
import { UsersService } from '../users/users.service';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    private usersService: UsersService,
    private filesService: FileService,
  ) {}

  async getAllAccessByFileId(fileId: string): Promise<Permission[]> {
    return await this.permissionRepository.find({
      relations: {
        user: true,
      },
      where: {
        file: {
          id: fileId,
        },
      },
    });
  }

  async updatePermission(
    requestUserId: string,
    requestUserRole: Role,
    fileId: string,
    permissionId: string,
    permissionLevel: PermissionLevel,
  ): Promise<Permission> {

    let fileOwner;

    if (
      !(await this.hasAccess(
        requestUserId,
        requestUserRole,
        fileId,
        PermissionLevel.MANAGE,
      ))
    ) {
      throw new ForbiddenException(
        "You don't have permission to assign permission to this file",
      );
    }

    // Check if trying to update to MANAGE permission
    if (permissionLevel === PermissionLevel.MANAGE) {
      const file = await this.filesService.getFileById(fileId);
      if (file.owner.id !== requestUserId && requestUserRole !== Role.Admin) {
        throw new ForbiddenException(
          "Only the file owner or admin can assign MANAGE permissions",
        );
      }
      fileOwner = file.owner.id;
    }


    const permission = await this.getPermissionById(permissionId);
    if (
      permission.user.id === requestUserId ||
      permission.user.role === Role.Admin
    ) {
      throw new ForbiddenException("You can't assign permission to yourself");
    }
    if (permission.user.id === fileOwner) {
      throw new ForbiddenException("You can't edit permission of file owner");
    }
    permission.permissionLevel = permissionLevel;
    const updatedPermission = await this.permissionRepository.save(permission);
    return updatedPermission;
  }

  async getPermissionById(id: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      relations: {
        file: {
          owner: true,
        },
        user: true,
      },
      where: {
        id,
      },
    });
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }
    return permission;
  }

  async getPermissionWithoutRelationById(id: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: {
        id,
      },
    });
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }
    return permission;
  }

  async getAllPermissions(): Promise<Permission[]> {
    return await this.permissionRepository.find({
      relations: {
        file: true,
        user: true,
      },
    });
  }

  async removePermission(
    requestUserId: string,
    requestUserRole: Role,
    fileId: string,
    permissionId: string,
  ): Promise<Permission> {
    if (
      !(await this.hasAccess(
        requestUserId,
        requestUserRole,
        fileId,
        PermissionLevel.MANAGE,
      ))
    ) {
      throw new ForbiddenException(
        "You don't have permission to assign permission to this file",
      );
    }
    const permission = await this.getPermissionById(permissionId);
    if (
      permission.user.id === requestUserId ||
      permission.user.role === Role.Admin
    ) {
      throw new ForbiddenException("You can't remove your permission");
    }

    await this.permissionRepository.delete(permission.id);
    return permission;
  }

  async assignPermission(
    requestUserId: string,
    requestUserRole: Role,
    userId: string,
    fileId: string,
    permissionLevel: PermissionLevel,
  ): Promise<Permission> {

    if (
      !(await this.hasAccess(
        requestUserId,
        requestUserRole,
        fileId,
        PermissionLevel.MANAGE,
      ))
    ) {
      throw new ForbiddenException(
        "You don't have permission to assign permission to this file",
      );
    }

    // Check if trying to assign MANAGE permission
    if (permissionLevel === PermissionLevel.MANAGE) {
      const file = await this.filesService.getFileById(fileId);
      if (file.owner.id !== requestUserId && requestUserRole !== Role.Admin) {
        throw new ForbiddenException(
          "Only the file owner can assign MANAGE permissions",
        );
      }
    }

    const access = await this.permissionRepository.findOne({
      where: {
        file: {
          id: fileId,
        },
        user: {
          id: userId,
        },
      },
    });

    if (access && access.permissionLevel >= permissionLevel) {
      throw new ConflictException('User already has permission');
    }

    const user = await this.usersService.getUserById(userId);
    if (user.id === requestUserId || user.role === Role.Admin) {
      throw new ForbiddenException(
        "You can't assign permission to yourself or admin",
      );
    }

    let permission: Permission;
    if (!access) {
      const file = await this.filesService.getFileById(fileId);
      permission = this.permissionRepository.create({
        file: file,
        user: user,
        permissionLevel,
      });
      permission = await this.permissionRepository.save(permission);
    } else {
      access.permissionLevel = permissionLevel;
      permission = await this.permissionRepository.save(access);
    }
    
    return permission;
  }

  async hasAccess(
    userId: string,
    userRole: Role,
    fileId: string,
    required: PermissionLevel,
  ): Promise<boolean> {
    if (userRole === Role.Admin) return true;

    const permission = await this.permissionRepository.findOne({
      where: {
        file: { id: fileId },
        user: { id: userId },
      },
    });
    if (!permission) {
      return false;
    }
    return permission.permissionLevel >= required;
  }
}
