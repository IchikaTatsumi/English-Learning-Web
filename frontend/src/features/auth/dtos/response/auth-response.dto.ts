export interface UserDto {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: 'Admin' | 'User';
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthResponseDto {
  accessToken: string;
  user: UserDto;
}