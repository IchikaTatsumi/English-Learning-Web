import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * ✅ Migration: Add first_learned_at column to vocabulary_progress
 *
 * This migration adds the first_learned_at column which:
 * - Tracks when a user first learned a vocabulary (scored 3/4 or higher)
 * - Is set ONCE and never changed afterwards
 * - Used for displaying learned date in "Learned" tab
 */
export class AddFirstLearnedAt1700000000001 implements MigrationInterface {
  name = 'AddFirstLearnedAt1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ✅ Add first_learned_at column
    await queryRunner.query(`
      ALTER TABLE "vocabulary_progress" 
      ADD COLUMN "first_learned_at" TIMESTAMP WITH TIME ZONE
    `);

    // ✅ Create index for performance
    await queryRunner.query(`
      CREATE INDEX "idx_vocab_progress_first_learned" 
      ON "vocabulary_progress" ("first_learned_at")
    `);

    // ✅ Migrate existing data:
    // Set first_learned_at = last_reviewed_at for already learned vocabs
    await queryRunner.query(`
      UPDATE "vocabulary_progress" 
      SET "first_learned_at" = "last_reviewed_at" 
      WHERE "is_learned" = TRUE 
        AND "last_reviewed_at" IS NOT NULL
        AND "first_learned_at" IS NULL
    `);

    console.log(
      '✅ Migration: Added first_learned_at column to vocabulary_progress',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ✅ Drop index
    await queryRunner.query(`
      DROP INDEX IF EXISTS "idx_vocab_progress_first_learned"
    `);

    // ✅ Drop column
    await queryRunner.query(`
      ALTER TABLE "vocabulary_progress" 
      DROP COLUMN IF EXISTS "first_learned_at"
    `);

    console.log('✅ Migration: Reverted first_learned_at column');
  }
}
