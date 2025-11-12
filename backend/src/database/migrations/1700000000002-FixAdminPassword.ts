import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

/**
 * ✅ MIGRATION: Auto-Generate Admin Password Hash
 *
 * File location: backend/src/database/migrations/1700000000002-FixAdminPassword.ts
 *
 * Cách sử dụng:
 * 1. Copy file này vào folder backend/src/database/migrations/
 * 2. Chạy: npm run migration:run
 * 3. Done! Password mới được generate và update tự động
 */
export class FixAdminPassword1700000000002 implements MigrationInterface {
  name = 'FixAdminPassword1700000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🔐 Starting admin password update...');
    console.log('📝 Target password: admin123');

    // ✅ Generate fresh bcrypt hash cho 'admin123'
    const SALT_ROUNDS = 10;
    const password = 'admin123';

    console.log(`⚙️  Generating bcrypt hash (salt rounds: ${SALT_ROUNDS})...`);
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log(`✅ Hash generated: ${hashedPassword.substring(0, 20)}...`);

    // ✅ Verify hash trước khi update
    const isValid = await bcrypt.compare(password, hashedPassword);
    if (!isValid) {
      throw new Error('❌ Hash verification failed!');
    }
    console.log('✅ Hash verification: OK');

    // ✅ Update tất cả admin users
    const result = await queryRunner.query(
      `UPDATE "user" 
       SET password = $1 
       WHERE role = 'Admin' OR username = 'admin' OR email = 'admin@example.com'
       RETURNING user_id, username, email, role`,
      [hashedPassword],
    );

    console.log(`✅ Updated ${result.length} admin user(s):`);
    result.forEach((user: any) => {
      console.log(`   - ${user.username} (${user.email}) - ${user.role}`);
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Admin password updated successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🔑 Login Credentials:');
    console.log('   Username: admin');
    console.log('   Email:    admin@example.com');
    console.log('   Password: admin123');
    console.log('\n📝 Test login với:');
    console.log('   POST /api/auth/login');
    console.log(
      '   Body: { "usernameOrEmail": "admin", "password": "admin123" }',
    );
    console.log('');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('⚠️  Rolling back admin password change');
    console.log('⚠️  Cannot restore old password (not stored)');
    console.log('⚠️  Please reset admin password manually if needed');
  }
}
