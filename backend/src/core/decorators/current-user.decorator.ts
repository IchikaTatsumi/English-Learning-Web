import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserPayload, RequestWithUser } from '../interfaces/request.types';

export const CurrentUser = createParamDecorator(
  <K extends keyof UserPayload>(
    data: K | undefined,
    ctx: ExecutionContext,
  ): UserPayload | UserPayload[K] | undefined => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      return undefined;
    }

    return data ? user[data] : user;
  },
);
