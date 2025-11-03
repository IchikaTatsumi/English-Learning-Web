import { ConflictException } from '@nestjs/common';
import { ObjectLiteral, Repository } from 'typeorm';

export async function ensureUnique<T extends ObjectLiteral>(
  repo: Repository<T>,
  conditions: Partial<T>,
  entityName = 'Entity',
): Promise<void> {
  const existing = await repo.findOne({ where: conditions });
  if (existing) {
    throw new ConflictException(
      `${entityName} already exists with the same unique fields`,
    );
  }
}
