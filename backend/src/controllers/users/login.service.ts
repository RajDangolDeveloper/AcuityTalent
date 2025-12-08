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

  async validateUser(loginDto: LoginDto): Promise<any> {
    try {
      const email = loginDto.email;
      const password = loginDto.password;

      const user = await this.prisma.user.findUnique({
        where: { email: email },
        select: {
          id: true,
          email: true,
          passwordHash: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = password === user.passwordHash;

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid Credentials');
      }

      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      throw new UnauthorizedException('Authenticated Failed');
    }
  }
}
