import { Module } from '@nestjs/common';
import { MinioClientService } from './minio.service';
import { NestMinioModule } from 'nestjs-minio'; 
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [MinioClientService],
  imports: [
    NestMinioModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        endPoint: configService.get('minio').endPoint,
        port: configService.get('minio').port,
        useSSL: configService.get('minio').useSSL,
        accessKey: configService.get('minio').accessKey,
        secretKey: configService.get('minio').secretKey,
      }),
    }),
  ],
  exports: [MinioClientService],
})
export class MinioClientModule {}
