import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { extname } from 'path';
import { UploadFileDto } from './dto/upload-file.dto';
import { UploadType } from './types/types';

@Injectable()
export class SpacesService {
  private s3Client: S3Client;
  private publicBucket: string;
  private privateBucket: string;
  private endpoint: string;
  constructor(private configService: ConfigService) {
    this.endpoint = this.configService.get<string>('AWS_ENDPOINT')!;
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION')!,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_KEY')!,
        secretAccessKey: this.configService.get<string>('AWS_SECRET')!,
      },
      forcePathStyle: false,
    });
    this.privateBucket = this.configService.get<string>('AWS_BUCKET_PRIVATE')!;
    this.publicBucket = this.configService.get<string>('AWS_BUCKET_PUBLIC')!;
  }

  async uploadPublicFile(
    file: Express.Multer.File,
    dto: UploadFileDto,
  ): Promise<string> {
    try {
      var fileKey;
      if (dto.uploadType === UploadType.UserProfile) {
        fileKey = `users/${dto.id}/images/avatar.jpeg`;
      } else if (dto.uploadType === UploadType.CompanyProfile) {
        fileKey = `companies/${dto.id}/images/profile/logo.jpeg`;
      } else if (dto.uploadType === UploadType.CompanyBackground) {
        fileKey = `companies/${dto.id}/images/background/background.jpg`;
      } else {
        throw new InternalServerErrorException({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Invalid UploadType',
        });
      }

      const command = new PutObjectCommand({
        Bucket: this.publicBucket,
        Key: fileKey,
        Body: file.buffer,
        ContentType: dto.fileType,
        ACL: 'public-read',
      });

      await this.s3Client.send(command);

      return fileKey;
    } catch (error) {
      console.error('S3 upload failed:', error);
      throw new InternalServerErrorException('File upload failed');
    }
  }

  async uploadPrivateFile(file: File, dto: UploadFileDto): Promise<string> {
    const sanitizedName = dto.fileName.replace(/[^a-zA-Z0–9.-]/g, '_');
    const timestamp = Date.now();
    var fileKey;
    if (dto.uploadType === UploadType.UserProfile) {
      fileKey = `users/${dto.id}/images/${timestamp}-${sanitizedName}`;
    } else if (dto.uploadType === UploadType.CompanyProfile) {
      fileKey = `companies/${dto.id}/images/profile/${timestamp}-${sanitizedName}`;
    } else if (dto.uploadType === UploadType.CompanyBackground) {
      fileKey = `companies/${dto.id}/images/background/${timestamp}-${sanitizedName}`;
    } else {
      throw new InternalServerErrorException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Invalid UploadType',
      });
    }

    const command = new PutObjectCommand({
      Bucket: this.privateBucket,
      Key: fileKey,
      Body: file,
      ContentType: dto.fileType,
      ACL: 'private',
    });

    await this.s3Client.send(command);

    return fileKey;
  }

  async generateViewUrl(
    fileName: string,
    privateBucket: boolean,
    expiresIn = 3600,
  ) {
    var command;
    if (privateBucket) {
      command = new GetObjectCommand({
        Bucket: this.privateBucket,
        Key: fileName,
      });
    } else {
      command = new GetObjectCommand({
        Bucket: this.publicBucket,
        Key: fileName,
      });
    }

    return await getSignedUrl(this.s3Client, command, {
      expiresIn,
    });
  }

  async generateGetUrl(
    fileKey: string,
    privateBucket: boolean,
    expiresIn = 3600,
  ) {
    var command;
    if (privateBucket) {
      command = new GetObjectCommand({
        Bucket: this.privateBucket,
        Key: fileKey,
      });
    } else {
      command = new GetObjectCommand({
        Bucket: this.publicBucket,
        Key: fileKey,
      });
    }
    const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
    return signedUrl;
  }
}
