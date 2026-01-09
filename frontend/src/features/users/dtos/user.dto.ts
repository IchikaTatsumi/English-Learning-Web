import { Role } from '@/lib/constants/enums';

export interface CreateUserDTO {
  username: string;
  email: string; // ✅ Thêm
  fullName: string; // ✅ Thêm
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
  id: string | number; // Backend có thể trả về string hoặc number
  username: string;
  email: string;      // ✅ Bổ sung trường này
  fullName: string;   // ✅ Bổ sung trường này
  role: Role;
  createdAt: string;
}