import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from '../auth/dto/login.dto';
import * as brcypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LoginService {
  constructor(private prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }
}
