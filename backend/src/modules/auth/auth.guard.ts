import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/core/enums/role.enum';
import { IS_PUBLIC_KEY } from 'src/core/decorators/public.decorator';
import { ROLES_KEY } from 'src/core/decorators/role.decorator';
import { RequestWithUser } from 'src/core/types/request.types';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Check JWT authentication
    const canActivate = await super.canActivate(context);
    if (!canActivate) {
      return false;
    }

    // Check role-based authorization
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no specific roles required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Get user from request
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    // Check if user has required role
    const hasRole = requiredRoles.some((role) => user.role === role);
    return hasRole;
  }
}
