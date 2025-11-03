import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileModule } from '../files/file.module';
import { UserModule } from '../users/user.module';
import { Permission } from './entities/permission.entity';
import { PermissionsController } from './permission.controller';
import { PermissionsService } from './permission.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permission]),
    forwardRef(() => FileModule),
    forwardRef(() => UserModule),
  ],
  controllers: [PermissionsController],
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}
