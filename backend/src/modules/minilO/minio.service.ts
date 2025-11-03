import {
  Controller,
  Inject,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { Client } from 'minio';
import { MINIO_CONNECTION } from 'nestjs-minio';

@Controller()
export class MinioClientService implements OnModuleInit {
  bucketName = process.env.MINIO_BUCKET_NAME || 'pttkht';
  // use inject token
  constructor(@Inject(MINIO_CONNECTION) private readonly minioClient: Client) {}

  async onModuleInit() {
    await this.createBucketIfNotExists();
  }

  async createBucketIfNotExists() {
    const bucketExists = await this.minioClient.bucketExists(this.bucketName);

    if (!bucketExists) {
      await this.minioClient.makeBucket(this.bucketName);
    }
  }

  async getPresignedUrl(filename: string) {
    return await this.minioClient.presignedGetObject(
      this.bucketName,
      filename,
      60 * 60,
      {
        'response-content-disposition': `attachment; filename="${filename}"`,
      },
    );
  }

  async uploadFile(file: Express.Multer.File) {
    try {
      await this.minioClient.putObject(
        this.bucketName,
        file.originalname,
        file.buffer,
        file.size,
        {
          'Content-Type': file.mimetype,
        },
      );
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        error,
        'Error while uploading file to minio',
      );
    }
  }

  async removeFile(fileName: string) {
    try {
      await this.minioClient.removeObject(this.bucketName, fileName);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        error,
        'Error while removing file from minio',
      );
    }
  }

  async downloadFile(objectName: string): Promise<Buffer> {
    try {
      const dataStream = await this.minioClient.getObject(
        this.bucketName,
        objectName,
      );

      return await new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];

        dataStream.on('data', (chunk) => chunks.push(chunk));

        dataStream.on('end', () => {
          const fileBuffer = Buffer.concat(chunks);
          resolve(fileBuffer); // ✅ correct: resolves the promise
        });

        dataStream.on('error', (err) => {
          console.error('❌ Error reading file stream:', err);
          reject(
            new InternalServerErrorException(
              err,
              'Error while downloading file from MinIO',
            ),
          );
        });
      });
    } catch (err) {
      console.error('❌ MinIO error:', err);
      throw new InternalServerErrorException(
        err,
        'Error while downloading file from MinIO',
      );
    }
  }
}
