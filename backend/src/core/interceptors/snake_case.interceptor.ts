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
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const newKey = snakeCase(key);
        newObj[newKey] = this.transformToSnakeCase(
          (data as Record<string, unknown>)[key],
        );
      }
    }
    return newObj;
  }
}
