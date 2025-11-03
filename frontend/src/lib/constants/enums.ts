export enum Role {
  User = 'user',
  Admin = 'admin',
}

export enum PermissionLevel {
  VIEW = 1,    // Can view file details and download
  MANAGE = 2,  // Can delete file and manage permissions (combined WRITE + SHARE)
}
