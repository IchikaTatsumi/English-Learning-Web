import { Role } from '../enums/role.enum';

export interface UserPayload {
  id: number;
  username: string;
  email: string;
  role: Role;
}
