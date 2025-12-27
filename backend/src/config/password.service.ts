import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordService {
  private readonly saltRounds = 10;

  constructor(private configService: ConfigService) {}

  async hashPassword(password: string): Promise<string> {
    const pepper = this.configService.get<string>('PASSWORD_SECRET');

    if (!pepper) {
      throw new InternalServerErrorException(
        'PASSWORD_SECRET is missing in .env',
      );
    }

    const pepperedPassword = password + pepper;
    return bcrypt.hash(pepperedPassword, this.saltRounds);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    const pepper = this.configService.get<string>('PASSWORD_SECRET');

    if (!pepper) {
      throw new InternalServerErrorException(
        'PASSWORD_SECRET is missing in .env',
      );
    }

    const pepperedPassword = password + pepper;
    return bcrypt.compare(pepperedPassword, hash);
  }
}
