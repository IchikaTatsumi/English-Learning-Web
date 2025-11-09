export interface LoginDto {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterDto {
  username: string;
  email: string;
  fullName: string;
  password: string;
}

export interface AuthResponseDto {
  accessToken: string;
  user: UserDto;
}

export interface UserDto {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: 'Admin' | 'User';
  avatarUrl?: string;
  createdAt: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}
