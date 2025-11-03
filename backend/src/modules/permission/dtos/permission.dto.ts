import { Type } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { PermissionLevel } from 'src/core/constants/enums';
import { AutoExpose } from 'src/core/decorators/auto-expose.decorator';
import { BaseResponseDto } from 'src/core/dto/base.dto';
import { UserDTO } from 'src/modules/users/dtos/user.dto';

@AutoExpose()

@AutoExpose()
export class SimplePermissionDTO {
  id: string;
  permissionLevel: PermissionLevel;
}

export class CreatePermissionDTO {
  fileId: string;
  userId: string;
  @IsEnum(PermissionLevel, {
    message: `permission must be one of ${Object.values(PermissionLevel)}`,
  })
  permissionLevel: PermissionLevel;
}

export class UpdatePermissionDTO {
  fileId: string;
  @IsEnum(PermissionLevel, {
    message: `permission must be one of ${Object.values(PermissionLevel)}`,
  })
  permissionLevel: PermissionLevel;
}
