import { Request } from 'express';
import { Role } from '../enums/role.enum';

/**
 * ✅ UNIFIED: User payload trong JWT token
 * Dùng trong JwtStrategy.validate()
 */
export interface UserPayload {
  id: number;
  email: string;
  role: Role;
  username?: string; // Optional vì có thể không có trong token
}

/**
 * ✅ UNIFIED: Request object với user info
 * Dùng trong controllers và guards
 */
export interface RequestWithUser extends Request {
  user: UserPayload;
}
