// src/common/interceptors/snake-case.interceptor.ts

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { snakeCase } from 'change-case';
import { DateUtil } from '../utils/date.util'; // 💡 Import service

@Injectable()
export class SnakeCaseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => this.transformToSnakeCase(data)));
  }

  private transformToSnakeCase(data: any): any {
    if (data === null || typeof data !== 'object') {
      return data;
    }

    // 💡 Xử lý Date Object: Định dạng nó thành chuỗi
    if (data instanceof Date) {
      // Sử dụng DateUtilService để định dạng Date
      // Trả về chuỗi ISO 8601 là tiêu chuẩn cho API
      return DateUtil.formatDate(data, 'yyyy-MM-dd');
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.transformToSnakeCase(item));
    }

    const newObj = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const newKey = snakeCase(key);
        newObj[newKey] = this.transformToSnakeCase(data[key]);
      }
    }
    return newObj;
  }
}
