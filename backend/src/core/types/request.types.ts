import { Request } from 'express';
import { Role } from '../enums/role.enum';

export interface UserPayloadExtended {
  id: number;
  email: string;
  role: Role;
  username?: string;
}

export interface RequestWithUser extends Request {
  user: UserPayloadExtended;
}
