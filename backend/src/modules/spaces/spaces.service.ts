import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { extname } from 'path';

interface UploadFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

@Injectable()
export class SpacesService {
  private s3Client: S3Client;
  private bucket: string;
  private endpoint: string;
  constructor(private configService: ConfigService) {
    this.endpoint = this.configService.get<string>('DO_SPACES_ENDPOINT')!;
    this.s3Client = new S3Client({
      endpoint: `https://${this.endpoint}`,
      region: this.configService.get<string>('DO_SPACES_REGION')!,
      credentials: {
        accessKeyId: this.configService.get<string>('DO_SPACES_KEY')!,
        secretAccessKey: this.configService.get<string>('DO_SPACES_SECRET')!,
      },
      forcePathStyle: false,
    });
    this.bucket = this.configService.get<string>('DO_SPACES_BUCKET')!;
  }

  private generateFileName(originalName: string): string {
    return `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(originalName)}`;
  }

  getPublicUrl(relativePath: string): string {
    return `https://${this.bucket}.${this.endpoint}/${relativePath}`;
  }

  async uploadProfileImage(file: UploadFile): Promise<string> {
    const fileName = this.generateFileName(file.originalname);
    const key = `userProfiles/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    });

    await this.s3Client.send(command);
    return key;
  }

  async uploadCompanyLogo(file: UploadFile): Promise<string> {
    const fileName = this.generateFileName(file.originalname);
    const key = `companyLogos/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);
    return key;
  }

  async uploadCompanyBackground(file: UploadFile): Promise<string> {
    const fileName = this.generateFileName(file.originalname);
    const key = `companyBackgrounds/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);
    return key;
  }

  async uploadResume(file: UploadFile): Promise<string> {
    const fileName = this.generateFileName(file.originalname);
    const key = `resumes/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);
    return key;
  }

  async generateUploadUrl(
    fileName: string,
    contentType: string,
    expiresIn = 3600,
  ) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: fileName,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn,
    });

    const publicUrl = `https://${this.bucket}.${this.endpoint}/${encodeURIComponent(fileName)}`;

    return { signedUrl, publicUrl };
  }

  async generateGetUrl(fileKey: string, expiresIn = 3600) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: fileKey,
    });
    const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
    return signedUrl;
  }
}
