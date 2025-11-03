import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  CreatePermissionDTO,
  PermissionDTO,
  UpdatePermissionDTO,
} from './dtos/permission.dto';
import { PermissionsService } from './permission.service';

@ApiBearerAuth()
@ApiTags('Permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @ApiOkResponse({ type: [PermissionDTO] })
  @Get()
  async getAllPermissions(): Promise<PermissionDTO[]> {
    return PermissionDTO.fromEntities(
      await this.permissionsService.getAllPermissions(),
    );
  }

  @ApiOkResponse({ type: [PermissionDTO] })
  @Get('/file/:fileId')
  async getAllAccessByFileId(
    @Param('fileId') fileId: string,
  ): Promise<PermissionDTO[]> {
    const accessList = await this.permissionsService.getAllAccessByFileId(fileId);
    return PermissionDTO.fromEntities(accessList);
  }

  @ApiOkResponse({ type: PermissionDTO })
  @Get(':id')
  async getPermissionById(@Param('id') id: string): Promise<PermissionDTO> {
    const permission = await this.permissionsService.getPermissionById(id);
    return PermissionDTO.fromEntity(permission);
  }

  @ApiOkResponse({ type: PermissionDTO })
  @Patch(':permissionId')
  async updatePermission(
    @Request() req,
    @Param('permissionId') permissionId: string,
    @Body() dto: UpdatePermissionDTO,
  ): Promise<PermissionDTO> {
    return PermissionDTO.fromEntity(
      await this.permissionsService.updatePermission(
        req.user.id,
        req.user.role,
        dto.fileId,
        permissionId,
        dto.permissionLevel,
      ),
    );
  }

  @ApiOkResponse({ type: PermissionDTO })
  @Post('assign')
  async assignPermissionToFile(
    @Request() req,
    @Body() body: CreatePermissionDTO,
  ): Promise<PermissionDTO> {
    const permission = await this.permissionsService.assignPermission(
      req.user.id,
      req.user.role,
      body.userId,
      body.fileId,
      body.permissionLevel,
    );
    return PermissionDTO.fromEntity(permission);
  }

  @ApiOkResponse({ type: PermissionDTO })
  @Delete(':permissionId/file/:fileId')
  async removePermissionFromFile(
    @Request() req,
    @Param('permissionId') permissionId: string,
    @Param('fileId') fileId: string,
  ): Promise<PermissionDTO> {
    const permission = await this.permissionsService.removePermission(
      req.user.id,
      req.user.role,
      fileId,
      permissionId,
    );
    return PermissionDTO.fromEntity(permission);
  }
}
