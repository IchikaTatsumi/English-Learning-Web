export enum PermissionType {
  LEARN = 'user',
  MANAGE = 'admin',
}

export enum Role {
  User = 'user',
  Admin = 'admin',
}

export enum PermissionLevel {
  LEARN = 1, // Can view file details and download
  MANAGE = 2, // Can delete file and manage permissions (combined WRITE + SHARE)
}
