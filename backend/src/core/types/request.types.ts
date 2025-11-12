import { Request } from 'express';
import { Role } from '../enums/role.enum';

/**
 * ✅ User information attached to request after JWT authentication
 * This is the payload returned by JwtStrategy.validate()
 */
export interface RequestUser {
  id: number;
  email: string;
  role: Role;
}

/**
 * ✅ Express Request with authenticated user
 * Use this type in controllers that require authentication
 */
export interface RequestWithUser extends Request {
  user: RequestUser;
}

/**
 * ✅ Optional user (for routes that work with or without auth)
 * Use this when user might be undefined (e.g., public routes with optional auth)
 */
export interface RequestWithOptionalUser extends Request {
  user?: RequestUser;
}
