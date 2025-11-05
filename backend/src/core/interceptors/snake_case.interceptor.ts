import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { snakeCase } from 'change-case';
import { DateUtil } from '../utils/date.util';

@Injectable()
export class SnakeCaseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map((data) => this.transformToSnakeCase(data)));
  }

  private transformToSnakeCase(data: unknown): unknown {
    if (data === null || typeof data !== 'object') {
      return data;
    }

    // Handle Date Object: Format it to string
    if (data instanceof Date) {
      return DateUtil.formatDate(data, 'yyyy-MM-dd');
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.transformToSnakeCase(item));
    }

    const newObj: Record<string, unknown> = {};
    const dataRecord = data as Record<string, unknown>;

    Object.keys(dataRecord).forEach((key) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const newKey = snakeCase(key) as string;
      newObj[newKey] = this.transformToSnakeCase(dataRecord[key]);
    });

    return newObj;
  }
}
