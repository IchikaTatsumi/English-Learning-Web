import { Injectable, ValidationPipe, ArgumentMetadata } from '@nestjs/common';
import { camelCase } from 'change-case';

@Injectable()
export class CamelCaseTransformPipe extends ValidationPipe {
  async transform(value: any, metadata: ArgumentMetadata) {
    // Transform the incoming data from snake_case to camelCase before validation
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      !(value instanceof Date)
    ) {
      value = this.transformToCamelCase(value);
    }

    // Call the parent transform method to perform validation
    return super.transform(value, metadata);
  }

  private transformToCamelCase(data: any): any {
    if (data === null || typeof data !== 'object') return data;
    if (Array.isArray(data))
      return data.map((item) => this.transformToCamelCase(item));

    const newObj = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const newKey = camelCase(key);
        newObj[newKey] = this.transformToCamelCase(data[key]);
      }
    }
    return newObj;
  }
}
