import {
  ClassTransformOptions,
  instanceToPlain,
  plainToInstance,
} from 'class-transformer';

export abstract class BaseResponseDto {
  static fromEntity<T, E>(
    this: new () => T,
    entity: E,
    opts?: ClassTransformOptions,
  ): T {
    // convert class instance -> plain object first
    const plain = instanceToPlain(entity);
    return plainToInstance(this, plain, {
      excludeExtraneousValues: true,
      ...opts,
    });
  }

  static fromEntities<T, E>(
    this: new () => T,
    entities: E[],
    opts?: ClassTransformOptions,
  ): T[] {
    const plain = instanceToPlain(entities);
    return plainToInstance(this, plain, {
      excludeExtraneousValues: true,
      ...opts,
    }) as T[];
  }
}
