import { UserPermissionsDto, PermissionDto } from '../dtos/permission.dto';

export class PermissionService {
  async getUserPermissions(userId: string): Promise<UserPermissionsDto> {
    // Mock implementation - replace with actual API call
    return {
      userId,
      roles: [
        {
          id: '1',
          name: 'user',
          permissions: [
            {
              id: '1',
              name: 'Read Vocabulary',
              resource: 'vocabulary',
              action: 'read',
            },
            {
              id: '2',
              name: 'Update Progress',
              resource: 'progress',
              action: 'update',
            },
          ],
        },
      ],
      permissions: [],
    };
  }

  async checkPermission(userId: string, resource: string, action: string): Promise<boolean> {
    // Mock implementation - replace with actual API call
    const userPermissions = await this.getUserPermissions(userId);
    return userPermissions.roles.some(role =>
      role.permissions.some(
        permission =>
          permission.resource === resource && permission.action === action
      )
    );
  }
}

export const permissionService = new PermissionService();
