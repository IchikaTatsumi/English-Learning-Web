export interface PermissionDto {
  id: string;
  name: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
}

export interface RoleDto {
  id: string;
  name: string;
  permissions: PermissionDto[];
}

export interface UserPermissionsDto {
  userId: string;
  roles: RoleDto[];
  permissions: PermissionDto[];
}
