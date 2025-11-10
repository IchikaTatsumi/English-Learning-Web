import { Role } from '@/lib/constants/enums';

export interface CreateUserDTO {
  username: string;
  password: string;
}

export interface LoginDTO {
  username: string;
  password: string;
}

export interface LoginResponseDTO {
  user: UserDTO;
  token: string;
}

export interface UserDTO {
  id: string;
  username: string;
  role: Role; // ✅ Using centralized Role enum
  createdAt: string; // ISO date string
}